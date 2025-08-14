"use client"

import { Card, CardContent } from "@/components/ui/card"

interface VideoSectionProps {
  language: "en" | "it"
}

export default function VideoSection({ language }: VideoSectionProps) {
  const content = {
    en: {
      title: "A Personal Message",
      subtitle: "Understanding depression and how to help",
      description:
        "In this insightful video, Dr. Katiuscia shares valuable advice on supporting those who struggle with depression. Learn what not to say and discover more compassionate ways to help.",
      keyPoints: [
        "Professional insights on depression support",
        "Practical communication strategies",
        "Building empathy and understanding",
        "Creating safe spaces for healing",
      ],
      videoId: "N4ZYIHht4ZE",
      videoTitle: "4 Things not to say to a depressed person"
    },
    it: {
      title: "Un Messaggio Personale",
      subtitle: "Comprendere la depressione e come aiutare",
      description:
        "In questo video illuminante, la Dr.ssa Katiuscia condivide preziosi consigli su come supportare chi lotta con la depressione. Scopri cosa non dire e trova modi più compassionevoli per aiutare.",
      keyPoints: [
        "Approfondimenti professionali sul supporto alla depressione",
        "Strategie di comunicazione pratiche",
        "Costruire empatia e comprensione",
        "Creare spazi sicuri per la guarigione",
      ],
      videoId: "OVttVmzSgTM",
      videoTitle: "4 cose da NON dire a una persona depressa"
    },
  }

  const currentContent = content[language]

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-cream-100 to-stone-50 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-stone-800 mb-4">{currentContent.title}</h2>
          <p className="text-xl text-stone-500 font-light">{currentContent.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Video - Portrait Format */}
          <div className="flex justify-center">
            <Card className="bg-white/90 border-cream-200 backdrop-blur-sm overflow-hidden max-w-sm">
              <CardContent className="p-0">
                <div className="relative" style={{ aspectRatio: "9/16" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${currentContent.videoId}`}
                    title={currentContent.videoTitle}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Text Content */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-light text-stone-800 mb-4">"{currentContent.videoTitle}"</h3>
              <p className="text-lg text-stone-600 leading-relaxed font-light">{currentContent.description}</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-stone-700">
                {language === "en" ? "What you'll learn:" : "Cosa imparerai:"}
              </h4>
              <ul className="space-y-3">
                {currentContent.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-stone-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-stone-600 font-light">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-cream-50 border border-cream-200 rounded-lg p-6">
              <p className="text-stone-700 italic font-light">
                {language === "en"
                  ? "This video reflects Dr. Katiuscia's compassionate approach to mental health support and her commitment to educating both clients and their loved ones."
                  : "Questo video riflette l'approccio compassionevole della Dr.ssa Katiuscia al supporto della salute mentale e il suo impegno nell'educare sia i clienti che i loro cari."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
