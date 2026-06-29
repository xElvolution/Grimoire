import { ethers } from "ethers";
import { Indexer, MemData } from "@0gfoundation/0g-ts-sdk";
import { ZEROG, getPrivateKey } from "./config";

export type UploadResult = { rootHash: string; txHash: string };

function makeSigner(): ethers.Wallet {
  const provider = new ethers.JsonRpcProvider(ZEROG.rpcUrl);
  return new ethers.Wallet(getPrivateKey(), provider);
}

export async function uploadJSON(obj: unknown): Promise<UploadResult> {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  if (bytes.length === 0) throw new Error("Cannot upload empty data");

  const indexer = new Indexer(ZEROG.storageIndexer);
  const memData = new MemData(bytes);

  const [, treeErr] = await memData.merkleTree();
  if (treeErr !== null) throw new Error(`merkle tree failed: ${treeErr}`);

  const [tx, uploadErr] = await indexer.upload(
    memData,
    ZEROG.rpcUrl,
    makeSigner() as unknown as never
  );
  if (uploadErr !== null) throw new Error(`upload failed: ${uploadErr}`);

  if (tx && "rootHash" in tx) {
    return { rootHash: tx.rootHash as string, txHash: tx.txHash as string };
  }
  return {
    rootHash: (tx as { rootHashes: string[] }).rootHashes[0],
    txHash: (tx as { txHashes: string[] }).txHashes[0],
  };
}

export async function downloadJSON<T = unknown>(rootHash: string): Promise<T> {
  if (!/^0x[0-9a-fA-F]{64}$/.test(rootHash)) {
    throw new Error(`invalid root hash: ${rootHash}`);
  }
  const indexer = new Indexer(ZEROG.storageIndexer);
  const [blob, err] = await indexer.downloadToBlob(rootHash, { proof: true });
  if (err !== null) throw new Error(`download failed: ${err}`);
  const text = await blob.text();
  return JSON.parse(text) as T;
}
