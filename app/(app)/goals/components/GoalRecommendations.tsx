// app/components/goals/GoalRecommendations.tsx
import { Button } from "@/components/ui/button";
import { Check, Plus, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// Using the same GoalTemplate type from the API
type GoalTemplate = {
  title: string;
  category: 'weekly' | 'long_term';
  metric: string;
  target_value: number;
  description: string;
};

interface GoalRecommendationsProps {
  recommendations: GoalTemplate[];
  onAccept: (recommendation: GoalTemplate) => void;
  onCreateCustom: () => void;
  isLoading: boolean;
}

export function GoalRecommendations({ recommendations, onAccept, onCreateCustom, isLoading }: GoalRecommendationsProps) {
  if (isLoading) {
    return (
        <div className="bg-card/50 p-12 rounded-3xl border-2 border-dashed border-muted flex flex-col items-center justify-center text-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground font-medium animate-pulse">Generating personalized recommendations...</p>
        </div>
    );
  }

  if (recommendations.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-gradient-to-b from-primary/5 to-transparent rounded-[3rem] border-2 border-dashed border-primary/20">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Target className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No active goals yet</h2>
            <p className="text-muted-foreground max-w-sm mb-8">
                Every journey starts with a single step. Set your first goal today and start tracking your progress!
            </p>
            <Button 
                onClick={onCreateCustom} 
                size="lg" 
                className="rounded-2xl px-8 h-14 text-lg font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all"
            >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Goal
            </Button>
        </div>
    )
  }

  return (
    <section className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Goal Suggestions
            </h2>
        </div>
        <p className="text-muted-foreground">Based on your profile, we think these are a great fit. You can accept them or create your own.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={index} 
            className="bg-card p-6 rounded-3xl border-2 border-transparent hover:border-primary/20 transition-all flex flex-col group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-primary/10" />
            
            <div className="flex-grow relative z-10">
                <h3 className="font-bold text-card-foreground text-xl leading-tight">{rec.title}</h3>
                <p className="text-muted-foreground text-sm mt-2 mb-6 line-clamp-2">{rec.description}</p>
            </div>
            
            <div className="flex items-center justify-between mt-4 relative z-10">
                <div>
                    <span className="font-black text-2xl text-primary">{rec.target_value}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1.5 block">
                        {rec.metric.replace(/_/g, ' ')}
                    </span>
                </div>
                <Button 
                    onClick={() => onAccept(rec)} 
                    size="sm" 
                    className="rounded-xl font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white border-none shadow-none"
                >
                    <Check className="w-4 h-4 mr-1.5" />
                    Accept
                </Button>
            </div>
          </motion.div>
        ))}

        {/* Custom Goal Card at the end of recommendations */}
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: recommendations.length * 0.1 }}
            onClick={onCreateCustom}
            className="p-6 rounded-3xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center text-center gap-3 min-h-[200px] group"
        >
            <div className="w-12 h-12 rounded-2xl bg-muted group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
            </div>
            <div>
                <p className="font-bold text-lg group-hover:text-primary transition-colors">Custom Goal</p>
                <p className="text-sm text-muted-foreground">Create your own specific target</p>
            </div>
        </motion.button>
      </div>
    </section>
  );
}
