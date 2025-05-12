import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ResponseHintsProps {
  hints: string[];
  isVisible: boolean;
  toggleVisibility: () => void;
}

export default function ResponseHints({ hints, isVisible, toggleVisibility }: ResponseHintsProps) {
  const [animatedHints, setAnimatedHints] = useState(hints);
  
  // Handle smooth transition when hints change
  useEffect(() => {
    if (JSON.stringify(hints) !== JSON.stringify(animatedHints)) {
      const hintsContainer = document.querySelector('.hints-container');
      if (hintsContainer) {
        hintsContainer.classList.add('opacity-0');
        setTimeout(() => {
          setAnimatedHints(hints);
          setTimeout(() => {
            hintsContainer.classList.remove('opacity-0');
          }, 50);
        }, 300);
      } else {
        setAnimatedHints(hints);
      }
    }
  }, [hints]);

  // Function to determine if a hint is pointing out an error
  const isErrorHint = (hint: string): boolean => {
    const errorIndicators = [
      'avoid', 'don\'t', 'incorrect', 'error', 'mistake', 'wrong', 'instead', 
      'missed', 'failed', 'improve', 'fix', 'revise', 'correct', 'change'
    ];
    
    return errorIndicators.some(indicator => 
      hint.toLowerCase().includes(indicator)
    );
  };

  // Function to determine if a hint is a positive reinforcement
  const isPositiveHint = (hint: string): boolean => {
    const positiveIndicators = [
      'good job', 'well done', 'continue', 'keep', 'great', 'excellent', 
      'effective', 'strong', 'successful'
    ];
    
    return positiveIndicators.some(indicator => 
      hint.toLowerCase().includes(indicator)
    );
  };

  // Function to get the appropriate icon and style for a hint
  const getHintStyle = (hint: string) => {
    if (isErrorHint(hint)) {
      return {
        icon: <AlertCircle size={14} className="text-amber-500" />,
        className: "text-sm text-gray-600 bg-amber-50 p-2 rounded border border-amber-100 shadow-sm"
      };
    } else if (isPositiveHint(hint)) {
      return {
        icon: <CheckCircle2 size={14} className="text-green-500" />,
        className: "text-sm text-gray-600 bg-green-50 p-2 rounded border border-green-100 shadow-sm"
      };
    } else {
      return {
        icon: null,
        className: "text-sm text-gray-600 bg-white p-2 rounded border border-gray-100 shadow-sm"
      };
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-gray-50 shadow-sm h-full flex flex-col">
      <div 
        className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        onClick={toggleVisibility}
      >
        <div className="flex items-center gap-2">
          <HelpCircle size={16} />
          <h3 className="text-sm font-medium">Response Hints</h3>
        </div>
        <motion.div
          animate={{ rotate: isVisible ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ height: "auto" }}
        animate={{ 
          height: isVisible ? "auto" : 0,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        style={{ overflow: "hidden" }}
        className="flex-1"
      >
        <div className="p-4 pt-2 border-t border-gray-200 h-full overflow-y-auto">
          <p className="text-xs text-gray-500 mb-3">
            These hints highlight what you did well and what needs improvement in your previous responses.
          </p>
          <ul className="space-y-2 hints-container transition-opacity duration-300">
            {animatedHints.map((hint, index) => {
              const { icon, className } = getHintStyle(hint);
              return (
                <motion.li 
                  key={index} 
                  className={className}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-2">
                    {icon && <div className="mt-0.5">{icon}</div>}
                    <span>{hint}</span>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}