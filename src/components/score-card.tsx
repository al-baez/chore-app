import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreCardProps {
  title: string;
  score: number;
  description?: string;
  className?: string;
}

export default function ScoreCard({ title, score, description, className }: ScoreCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{score}</div>
      </CardContent>
    </Card>
  );
} 