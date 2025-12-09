import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Share2, Lock, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ShareableAchievementCard } from "./ShareableAchievementCard";

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  earned_at?: string;
  earned: boolean;
}

interface AchievementsGalleryProps {
  userId: string;
  userName?: string;
}

export const AchievementsGallery = ({ userId, userName }: AchievementsGalleryProps) => {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      // Fetch all available badges
      const { data: allBadges } = await supabase
        .from("badges")
        .select("*")
        .order("created_at", { ascending: true });

      // Fetch user's earned badges
      const { data: userBadges } = await supabase
        .from("user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", userId);

      const earnedBadgeMap = new Map(
        userBadges?.map((ub) => [ub.badge_id, ub.earned_at]) || []
      );

      const badgesWithStatus: BadgeData[] = (allBadges || []).map((badge) => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        requirement: badge.requirement,
        earned: earnedBadgeMap.has(badge.id),
        earned_at: earnedBadgeMap.get(badge.id),
      }));

      setBadges(badgesWithStatus);
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-pulse">Loading achievements...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            My Achievements
            <Badge variant="secondary" className="ml-2">
              {earnedBadges.length}/{badges.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Earned Badges
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {earnedBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
                      <div className="text-center">
                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                          {badge.icon}
                        </div>
                        <h4 className="font-semibold text-sm truncate">{badge.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {badge.description}
                        </p>
                        {badge.earned_at && (
                          <p className="text-xs text-primary mt-2">
                            {new Date(badge.earned_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                        onClick={() => setSelectedBadge(badge)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Badges */}
          {lockedBadges.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                <Lock className="h-5 w-5" />
                Locked Badges
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {lockedBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="bg-muted/30 rounded-xl p-4 border border-border opacity-60 hover:opacity-80 transition-all">
                      <div className="text-center">
                        <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                        <h4 className="font-semibold text-sm truncate text-muted-foreground">
                          {badge.name}
                        </h4>
                        <p className="text-xs text-muted-foreground/70 line-clamp-2 mt-1">
                          {badge.description}
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {badges.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No badges available yet. Start taking quizzes to earn achievements!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <ShareableAchievementCard
            achievement={{
              name: selectedBadge.name,
              description: selectedBadge.description,
              icon: selectedBadge.icon,
              type: "badge",
            }}
            userName={userName}
            onClose={() => setSelectedBadge(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};