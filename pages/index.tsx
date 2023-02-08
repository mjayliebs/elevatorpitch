import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import DropDown, { VibeType } from "../components/DropDown";
import Footer from "../components/Footer";
import Github from "../components/GitHub";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import ResizablePanel from "../components/ResizablePanel";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [pitch, setPitch] = useState("");
  const [vibe, setVibe] = useState<VibeType>("Professional");
  const [generatedPitches, setGeneratedPitches] = useState<String>("");

  const defaultPitch = 'A Converstional CRM that learns and adapts after each conversations with customers and prospects.';
  let idea = pitch || defaultPitch;

  console.log("Streamed response: ", generatedPitches);

  const prompt =
    vibe === "Funny"
      ? `Generate 3 business focused elevator pitch ideas for ${idea} 100 words in length, each starting with a letter, no numbers and ending in [IDEA]. The first should be funny, the second very serious, the third a parity full of buzzwords.
        }`
      : `Generate 3 ${vibe} focused elevator pitch ideas based on the idea in ${idea} 100 words in length, each starting with a letter, no numbers and ending in [IDEA]. The first should be business value based, the second focused on market trends, the third a pitch towards early adopters.
        }`;

  const generatePitch = async (e: any) => {
    e.preventDefault();
    setGeneratedPitches("");
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });
    console.log("Edge function returned.");

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setGeneratedPitches((prev) => prev + chunkValue);
    }

    setLoading(false);
  };

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2">
      <Head>
        <title>Elevator Pitch Generator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4">
        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            />
            <p className="text-left font-medium">
              What is your idea, be brief... {" "}
              <span className="text-slate-500">
                (or not)
              </span>
              .
            </p>
          </div>
          <textarea
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={
              "e.g. A Converstional CRM that learns and adapts after each conversations with customers and prospects."
            }
          />
          <div className="flex mb-5 items-center space-x-3">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
            <p className="text-left font-medium">Select your vibe.</p>
          </div>
          <div className="block">
            <DropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)} />
          </div>

          {!loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              onClick={(e) => generatePitch(e)}
            >
              Generate your Pitch &rarr;
            </button>
          )}
          {loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="space-y-10 my-10">
              {generatedPitches && (
                <>
                  <div>
                    <h3 className="sm:text-3xl text-2xl font-bold text-slate-900 mx-auto">
                      Your Generated Pitches
                    </h3>
                  </div>
                  <div className="space-y-8 flex flex-col items-left justify-left max-w-xl mx-auto">
                    {generatedPitches
                      .substring(generatedPitches.indexOf("1") + 3)
                      .split("[IDEA]")
                      .map((generatedPitch) => {
                        return (
                          <div
                            className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border text-left"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedPitch);
                              toast("pitch copied to clipboard", {
                                icon: "✂️",
                              });
                            }}
                            key={generatedPitch}
                          >
                            <p>{generatedPitch}</p>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
