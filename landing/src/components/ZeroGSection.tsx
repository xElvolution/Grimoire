"use client";

import Reveal from "./Reveal";

export default function ZeroGSection() {
  return (
    <section id="zerog" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <div className="rounded-3xl glass rune-border p-8 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-arcane/10 via-transparent to-mana/10 pointer-events-none" />
            <p className="relative text-xs tracking-[0.3em] uppercase text-mana">
              Why it can only exist on 0G
            </p>
            <h2 className="relative mt-4 font-display text-3xl sm:text-5xl text-parchment leading-tight">
              &ldquo;Trustless royalties for AI skills&rdquo;
              <br />
              <span className="text-ash text-2xl sm:text-3xl">
                is a sentence no centralized platform can say.
              </span>
            </h2>
            <p className="relative mt-6 mx-auto max-w-2xl text-ash text-lg leading-relaxed">
              A royalty economy needs one impossible thing on normal infra:{" "}
              <span className="text-parchment">proof a skill was actually used.</span>{" "}
              On 0G, every use runs inside a hardware enclave and is signed - so
              usage is verifiable, and creators get paid without trusting anyone.
              That&apos;s the moat. That&apos;s the whole reason this is built here.
            </p>

            <div className="relative mt-10 grid sm:grid-cols-3 gap-4 text-left">
              {[
                {
                  t: "0G Storage",
                  d: "Every skill and memory - permanent, ownable, and yours.",
                },
                {
                  t: "0G Compute",
                  d: "Sealed Inference (TEE) - provable usage, the root of trustless royalties.",
                },
                {
                  t: "0G Chain",
                  d: "ERC-7857 identity, skill ownership & instant royalty settlement.",
                },
              ].map((b) => (
                <div
                  key={b.t}
                  className="rounded-xl bg-void/50 border border-white/5 p-5"
                >
                  <div className="font-display text-lg text-arcane-bright">
                    {b.t}
                  </div>
                  <div className="mt-2 text-sm text-ash leading-relaxed">{b.d}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
