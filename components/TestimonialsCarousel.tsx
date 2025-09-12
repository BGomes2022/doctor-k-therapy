"use client"

import { useState, useEffect, useRef } from "react"

interface Testimonial {
  content: string
  author: string
  country: string
  flag: string
}

const testimonials: Testimonial[] = [
  {
    content: "Parlare con Katy è spronante. Riconosco di essere un osso duro, ma la sua schiettezza e risolutezza mi permettono di continuare ad auto esaminarmi anche successivamente alla seduta e vedere le cose come stanno e quindi di affrontarle con realismo e concretezza.",
    author: "Ilenia",
    country: "Italia",
    flag: "🇮🇹"
  },
  {
    content: "Katiuscia är extraordinär, hon förändrar ditt liv",
    author: "B.",
    country: "Sweden",
    flag: "🇸🇪"
  },
  {
    content: "I had a narcissistic mother and a weak, absent father. I married a narcissist, and with Katiuscia, I was able to see familiar patterns and set strong boundaries. Through our work, I'm able to believe in myself and cut out harmful conversations about my husband and mother. I feel happy because for the first time, I don't feel inadequate or stupid. I will always be grateful to Katiuscia.",
    author: "Fede",
    country: "UK",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿"
  },
  {
    content: "Parlare con Katiuscia e' stato scioccante e' illuminante parlare con lei. Dopo che parliamo sono più felice",
    author: "Davide",
    country: "Italia",
    flag: "🇮🇹"
  },
  {
    content: "Katiuscia has helped me be more flexible yet organized with my children's needs. Together, we'll figure out which strategy is best for them and for me as a good mom.",
    author: "N.",
    country: "USA",
    flag: "🇺🇸"
  },
  {
    content: "I will always be grateful to Katiuscia, who with warmth and professionalism pointed out to me that my bulimia was rooted in my past and my emotions. With tools in sessions and work on myself, I now have a positive attitude towards food and I feel beautiful and understood.",
    author: "Anna",
    country: "United States",
    flag: "🇺🇸"
  },
  {
    content: "Working with her feels like opening a window to a brighter, lighter life. I'm growing, healing, and finally free from what once held me back.",
    author: "Ashley",
    country: "United States",
    flag: "🇺🇸"
  },
  {
    content: "From the very first session I felt confident because I could feel Katiuscia was not only highly experienced, but more importantly, truly invested in helping me through the hard yards I've never before tackled.",
    author: "Jade",
    country: "Australia",
    flag: "🇦🇺"
  },
  {
    content: "Katiuscia helped me and my husband to overcome survivors guilt of a childhood tragedy and an healthy communication style that we had as a couple. We are happy now.",
    author: "Sarah",
    country: "Canada",
    flag: "🇨🇦"
  },
  {
    content: "Ho avuto altri terapisti in passato ma mai nessuno mi aveva capito cosi nel profondo. Mi sento capita, ascoltata, mai giudicata e soprattutto vista per quello che sono. Con estrema professionalità ma anche dolcezza ed empatia mi sta aiutando ad avere gli strumenti e i pensieri giusti nel mio percorso per riuscire ad avere una vita migliore.",
    author: "Clelia",
    country: "Italia",
    flag: "🇮🇹"
  },
  {
    content: "With my extreme OCD, I was a slave to myself and felt unloved and misunderstood by my family, to whom I subjected absurd routines. Katiuscia not only explained the origin of my fixations to me, but with behavioral and dynamic methods, I understood why I had them. It's hard, but Katiuscia is always there for me with messages and encouragement.",
    author: "Chiara",
    country: "Italia",
    flag: "🇮🇹"
  },
  {
    content: "With simplicity and clarity, Katiuscia showed me unhealthy life patterns and how to change them. I will always thank her for helping me avoid falling victim to anxiety and harmful people.",
    author: "P.",
    country: "Nigeria",
    flag: "🇳🇬"
  },
  {
    content: "As a man struggling with anger management and relationship issues, Katiuscia helped me understand the root causes of my emotional reactions. Her direct approach and practical tools gave me the confidence to change destructive patterns and build healthier relationships.",
    author: "Omar",
    country: "Morocco",
    flag: "🇲🇦"
  },
  {
    content: "Dealing with work stress and burnout, I felt lost and overwhelmed. Katiuscia's sessions helped me regain control of my life and set proper boundaries. I now have a much better work-life balance and feel more confident in my decisions.",
    author: "Samuele",
    country: "Italia",
    flag: "🇮🇹"
  }
]

export default function TestimonialsCarousel() {
  const [currentTranslate, setCurrentTranslate] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [expandedTestimonials, setExpandedTestimonials] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  // Duplicate testimonials for seamless loop
  const allTestimonials = [...testimonials, ...testimonials, ...testimonials]
  const testimonialWidth = 280 // Width of each testimonial card + gap
  const totalWidth = testimonials.length * testimonialWidth

  useEffect(() => {
    if (isPaused) return

    const animate = () => {
      setCurrentTranslate(prev => {
        const newTranslate = prev - 0.5 // Move 0.5px to the left (slower)
        
        // Reset to start when we've moved one full set
        if (Math.abs(newTranslate) >= totalWidth) {
          return 0
        }
        
        return newTranslate
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPaused, totalWidth])

  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedTestimonials)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedTestimonials(newExpanded)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true)
    const startX = e.touches[0].clientX
    const startTranslate = currentTranslate

    const handleTouchMove = (e: TouchEvent) => {
      const currentX = e.touches[0].clientX
      const diff = startX - currentX
      const newTranslate = startTranslate - diff * 2 // Multiply for more sensitive swiping
      
      // Keep within bounds
      if (newTranslate <= 0 && newTranslate >= -totalWidth * 2) {
        setCurrentTranslate(newTranslate)
      }
    }

    const handleTouchEnd = () => {
      setIsPaused(false)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-cream-50/30 overflow-hidden">
      <div className="container mx-auto max-w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-stone-800 mb-4">What People Say</h2>
          <p className="text-sm text-stone-500">*Some names have been changed for privacy</p>
        </div>

        <div 
          className="relative overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Fade overlays for smoother effect */}
          <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none opacity-60"></div>
          <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none opacity-60"></div>
          <div 
            ref={containerRef}
            className="flex gap-6 transition-none"
            style={{
              transform: `translateX(${currentTranslate}px)`,
              width: 'fit-content'
            }}
            onTouchStart={handleTouchStart}
          >
            {allTestimonials.map((testimonial, index) => {
              const originalIndex = index % testimonials.length
              const isExpanded = expandedTestimonials.has(originalIndex)
              const needsTruncation = testimonial.content.length > 150
              const displayContent = !needsTruncation || isExpanded 
                ? testimonial.content 
                : testimonial.content.slice(0, 150) + "..."

              return (
                <div 
                  key={`${originalIndex}-${Math.floor(index / testimonials.length)}`}
                  className="bg-gradient-to-br from-white via-cream-50/30 to-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 flex-shrink-0 border border-cream-200/50 backdrop-blur-sm hover:-translate-y-2"
                  style={{ width: '260px', minHeight: '160px' }}
                >
                  <div className="p-4 h-full flex flex-col relative overflow-hidden">
                    {/* Subtle background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/20 to-transparent rounded-full blur-2xl"></div>
                    
                    {/* Quote Content */}
                    <div className="flex-grow mb-3 relative z-10">
                      <div className="text-3xl text-stone-300 mb-2 font-serif leading-none">"</div>
                      <p className="text-stone-700 text-sm leading-snug font-light italic -mt-4 pl-4">
                        {displayContent}
                      </p>
                      {needsTruncation && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpanded(originalIndex)
                          }}
                          className="text-stone-500 text-xs hover:text-stone-700 underline mt-1 transition-colors pl-4"
                        >
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                    
                    {/* Author Section */}
                    <div className="pt-2 border-t border-cream-200/50 relative z-10">
                      <div className="font-medium text-stone-800 text-sm">
                        — {testimonial.author}
                      </div>
                      <div className="flex items-center gap-1 text-stone-500 text-xs mt-0.5">
                        <span className="text-sm">{testimonial.flag}</span>
                        <span className="font-light">{testimonial.country}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-stone-400">
            Hover to pause • Swipe to navigate manually
          </p>
        </div>
      </div>
    </section>
  )
}