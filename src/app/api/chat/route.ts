import { NextResponse } from "next/server";
import { getLLM } from "@/lib/langchainModels";

export async function POST(req: Request) {
  const { persona, messages } = await req.json();
  const llm = getLLM();

  // Enhanced system prompt with more context about the persona
  const systemPrompt = `
    You are roleplaying as this customer persona:

    Name: ${persona.name}
    Age: ${persona.age}
    Job Title: ${persona.job_title || persona.jobTitle}
    Challenge: ${persona.challenge}
    ${persona.interests ? `Interests: ${Array.isArray(persona.interests) ? persona.interests.join(", ") : persona.interests}` : ''}
    ${persona.location ? `Location: ${persona.location}` : ''}

    Answer as if you're this person, and let the user try to help you.
    Be consistent with your persona's traits, challenges, and communication style.
    `;

  const chatMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const result = await llm.invoke(chatMessages);
  const reply = result?.content || "I'm not sure what to say.";

  // Enhanced hints prompt that analyzes the conversation more deeply and focuses on errors
  const hintsPrompt = `
    You are an expert conversation coach analyzing an ongoing conversation between a customer service representative and a customer.
    
    Customer Persona:
    Name: ${persona.name}
    Age: ${persona.age}
    Job Title: ${persona.job_title || persona.jobTitle}
    Challenge: ${persona.challenge}
    ${persona.interests ? `Interests: ${Array.isArray(persona.interests) ? persona.interests.join(", ") : persona.interests}` : ''}
    ${persona.location ? `Location: ${persona.location}` : ''}
    
    Conversation History:
    ${messages.map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Representative' : 'Customer'}: ${m.content}`).join('\n')}
    
    Focus on the representative's MOST RECENT response and analyze it critically:
    1. Identify specific ERRORS or MISTAKES in their approach
    2. Point out any MISSED OPPORTUNITIES in their response
    3. Highlight any INCORRECT assumptions they made
    4. Note any INAPPROPRIATE tone or language used
    5. Identify where they could IMPROVE their response
    
    Also include 1-2 positive points about what they did well to balance the feedback.
    
    Provide 5 specific, actionable hints that will help the representative improve their next message.
    Each hint should be concise (under 15 words) and directly relevant to this specific conversation.
    
    At least 3 hints should point out something they did WRONG or could IMPROVE.
    
    Return ONLY a JSON array of 5 string hints without any additional text, explanation or formatting.
    Example format: ["Avoid technical jargon - simplify your explanation", "Don't ignore their concern about pricing", "Good job acknowledging their frustration", "Fix incorrect information about the return policy", "Ask more specific questions about their needs"]
  `;

  // Default hints for different conversation stages
  const initialHints = [
    "Ask open-ended questions about their challenge",
    "Show empathy for their specific situation",
    "Introduce yourself and establish rapport",
    "Listen carefully to their initial concerns",
    "Clarify what kind of help they're seeking"
  ];
  
  const earlyConversationHints = [
    "Acknowledge their specific concerns",
    "Ask follow-up questions to understand better",
    "Demonstrate understanding of their challenge",
    "Offer initial thoughts on potential solutions",
    "Maintain a supportive, helpful tone"
  ];
  
  let hints = initialHints;

  try {
    // Choose hints based on conversation stage
    if (messages.length >= 3) {
      // Deep conversation - generate custom hints
      const hintsResult = await llm.invoke([{ role: "user", content: hintsPrompt }]);
      const hintsContent = hintsResult?.content || "";
      
      if (typeof hintsContent === 'string') {
        // Try to extract JSON array from the response
        const jsonMatch = hintsContent.match(/\[.*\]/);

        
        // If we can't find a JSON array with the regex, try to parse the entire content
        if (!jsonMatch) {
          try {
            const parsed = JSON.parse(hintsContent);
            if (Array.isArray(parsed) && parsed.length > 0) {
              hints = parsed.slice(0, 5);
            }
          } catch (parseError) {
            console.error("Failed to parse hints JSON:", parseError);
          }
        } else {
          try {
            const parsedHints = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsedHints) && parsedHints.length > 0) {
              hints = parsedHints.slice(0, 5);
            }
          } catch (parseError) {
            console.error("Failed to parse hints JSON from match:", parseError);
          }
        }
      }
    } else if (messages.length >= 2) {
      // Early conversation - use early conversation hints
      hints = earlyConversationHints;
    }
  } catch (error) {
    console.error("Error generating hints:", error);
  }

  return NextResponse.json({ reply, hints });
}
