
import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, User, SendHorizontal, Sparkles, Heart, Activity, Brain, Pills, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const HealthAssistant = () => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    {
      role: "assistant",
      content: "👋 Hi there! I'm your health assistant. I can help you understand your blood test results, suggest lifestyle improvements, or answer general health questions. What would you like to know today?"
    }
  ]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage = { role: "user", content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    
    // Simulate AI thinking
    setIsTyping(true);
    
    try {
      // Simulate response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add simulated assistant response
      let responseContent = "";
      
      if (message.toLowerCase().includes("score") || message.toLowerCase().includes("health score")) {
        responseContent = "🏆 Your health score is calculated based on the values from your blood tests. For more detailed information, please check the Health Overview section on your dashboard. If you've recently uploaded a new test, it may take a moment to update.";
      } else if (message.toLowerCase().includes("next test") || message.toLowerCase().includes("when")) {
        responseContent = "📅 For most people, an annual comprehensive blood test is recommended. However, this can vary based on your age, existing health conditions, and risk factors. I suggest discussing with your healthcare provider about the ideal frequency for your specific situation.";
      } else if (message.toLowerCase().includes("improve") || message.toLowerCase().includes("better")) {
        responseContent = "💪 To improve your health scores, focus on: \n\n1. Regular physical activity (at least 150 minutes/week)\n2. A balanced diet rich in fruits, vegetables, whole grains\n3. Adequate hydration (8-10 glasses of water daily)\n4. Quality sleep (7-9 hours nightly)\n5. Stress management techniques\n\nSmall, consistent changes often yield the best long-term results!";
      } else if (message.toLowerCase().includes("cholesterol") || message.toLowerCase().includes("hdl") || message.toLowerCase().includes("ldl")) {
        responseContent = "🥗 To maintain healthy cholesterol levels:\n\n• Increase soluble fiber (oats, beans, fruits)\n• Choose healthy fats (olive oil, avocados, nuts)\n• Limit saturated and trans fats\n• Stay physically active\n• Consider plant sterols/stanols\n\nWould you like more specific advice based on your latest test results?";
      } else if (message.toLowerCase().includes("vitamin") || message.toLowerCase().includes("mineral")) {
        responseContent = "✨ Vitamins and minerals are essential for optimal health. If your blood tests show deficiencies, consider:\n\n• Vitamin D: Regular sun exposure, fatty fish, fortified foods\n• Iron: Red meat, beans, leafy greens\n• B vitamins: Whole grains, meat, eggs, legumes\n• Magnesium: Nuts, seeds, leafy greens\n\nAlways consult with your healthcare provider before starting supplements.";
      } else if (message.toLowerCase().includes("hormone") || message.toLowerCase().includes("thyroid")) {
        responseContent = "🧬 Hormone levels can significantly impact your overall health. For healthy hormone balance:\n\n• Maintain a healthy weight\n• Manage stress effectively\n• Get adequate sleep\n• Exercise regularly\n• Consider diet adjustments (e.g., limiting processed foods)\n\nIf your blood tests indicate hormone imbalances, I recommend following up with an endocrinologist for personalized guidance.";
      } else {
        responseContent = "I understand you're asking about " + message.slice(0, 30) + (message.length > 30 ? "..." : "") + ". To provide you with the most accurate information, I'd need to analyze your specific blood test results. Have you uploaded your latest blood test? If not, you can do so from the dashboard.";
      }
      
      const assistantMessage = { role: "assistant", content: responseContent };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting response:", error);
      toast.error("Sorry, I couldn't process your request right now.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold mb-2">Health Assistant</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Get personalized health insights and recommendations based on your blood test results.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-md w-full glass-card mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Chat with Health Assistant
              </CardTitle>
            </CardHeader>
            
            <CardContent className="overflow-y-auto max-h-[60vh] mb-2">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`flex max-w-[80%] ${msg.role === "assistant" ? "flex-row" : "flex-row-reverse"}`}>
                      <div className={`flex items-start p-1.5 ${msg.role === "assistant" ? "mr-2" : "ml-2"}`}>
                        {msg.role === "assistant" ? (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      
                      <div 
                        className={`p-3 rounded-lg ${
                          msg.role === "assistant" 
                            ? "bg-muted text-left" 
                            : "bg-primary text-primary-foreground text-right"
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[80%]">
                      <div className="flex items-start p-1.5 mr-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            
            <div className="px-4 py-2 border-t border-border">
              <div className="flex flex-wrap gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center"
                  onClick={() => handleQuickQuestion("What affects my health score?")}
                >
                  <Activity className="h-3 w-3 mr-1" />
                  Health Score
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center"
                  onClick={() => handleQuickQuestion("How can I improve my cholesterol?")}
                >
                  <Heart className="h-3 w-3 mr-1" />
                  Cholesterol
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center"
                  onClick={() => handleQuickQuestion("When should I take my next blood test?")}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Next Test
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center"
                  onClick={() => handleQuickQuestion("How do I improve my vitamin levels?")}
                >
                  <Pills className="h-3 w-3 mr-1" />
                  Vitamins
                </Button>
              </div>
            </div>
            
            <CardFooter className="pt-0">
              <div className="flex items-center w-full gap-2">
                <Textarea 
                  placeholder="Ask me anything about your health..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-10 flex-1"
                  maxLength={280}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage} disabled={!message.trim() || isTyping} size="icon">
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-8">
          <Tabs defaultValue="fitness" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fitness">
                <Dumbbell className="h-4 w-4 mr-2" />
                Fitness
              </TabsTrigger>
              <TabsTrigger value="nutrition">
                <Pills className="h-4 w-4 mr-2" />
                Nutrition
              </TabsTrigger>
              <TabsTrigger value="mental">
                <Brain className="h-4 w-4 mr-2" />
                Mental
              </TabsTrigger>
            </TabsList>
            <TabsContent value="fitness" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fitness Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Aim for 150 minutes of moderate exercise weekly</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Include both cardio and strength training</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Take 8,000-10,000 steps daily</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Include flexibility exercises like yoga</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Schedule rest days to prevent burnout</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="nutrition" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Nutrition Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Increase intake of leafy greens and vegetables</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Choose whole grains over refined carbohydrates</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Include omega-3 rich foods like fatty fish</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Stay hydrated with 8-10 glasses of water daily</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Limit processed foods and added sugars</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="mental" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mental Wellness Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Practice mindfulness meditation for 10 minutes daily</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Prioritize 7-9 hours of quality sleep</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Limit screen time before bed</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Maintain social connections and community</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Consider journaling to track mental wellbeing</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
