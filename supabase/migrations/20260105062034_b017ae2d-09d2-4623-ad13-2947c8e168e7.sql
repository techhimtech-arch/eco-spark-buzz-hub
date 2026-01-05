-- Create the update_updated_at_column function first (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create eco_tips table for Daily Eco Tips
CREATE TABLE public.eco_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tip TEXT NOT NULL,
  emoji TEXT DEFAULT '🌱',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create eco_facts table for Did You Know facts
CREATE TABLE public.eco_facts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fact TEXT NOT NULL,
  emoji TEXT DEFAULT '💡',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.eco_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_facts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for eco_tips
CREATE POLICY "Anyone can view active eco tips" ON public.eco_tips
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage eco tips" ON public.eco_tips
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for eco_facts
CREATE POLICY "Anyone can view active eco facts" ON public.eco_facts
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage eco facts" ON public.eco_facts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default eco tips
INSERT INTO public.eco_tips (tip, emoji) VALUES
  ('🌱 Aaj plastic bag mat lo — apna cloth bag use karo!', '🌱'),
  ('💧 Brush karte waqt tap band rakho — 6 liters paani bachega!', '💧'),
  ('🔌 Charger ko unplug karo jab use na ho — phantom power waste mat karo!', '🔌'),
  ('🚶 Short distances ke liye walk karo — health aur planet dono ka fayda!', '🚶'),
  ('🍃 Paper napkins ki jagah cloth napkins use karo!', '🍃'),
  ('♻️ Aaj ek cheez recycle karo — chhoti shuruat badi change laati hai!', '♻️'),
  ('🌿 Indoor plants lagao — air purify hogi aur mood bhi achha rahega!', '🌿'),
  ('🚿 5 minute shower lo — 45 liters paani bacha sakte ho!', '🚿'),
  ('📦 Online shopping kam karo — packaging waste reduce hoga!', '📦'),
  ('🍱 Khana waste mat karo — leftover ko kal ka lunch banao!', '🍱'),
  ('☀️ Din me natural light use karo — bijli bachao!', '☀️'),
  ('🥤 Reusable bottle carry karo — plastic bottles se bachao environment!', '🥤'),
  ('🌳 Mahine me ek ped lagao — future ke liye gift!', '🌳'),
  ('🛍️ Second-hand items try karo — reduce, reuse, recycle!', '🛍️'),
  ('🚲 Cycle chalao — fitness bhi, nature bhi khush!', '🚲');

-- Insert default eco facts
INSERT INTO public.eco_facts (fact, emoji) VALUES
  ('🌳 1 tree a year me 118 kg CO₂ absorb karta hai!', '🌳'),
  ('♻️ 1 recycled plastic bottle se 3 hours ki laptop energy bachti hai!', '♻️'),
  ('🐝 Duniya ka 75% food bees ke pollination pe depend karta hai!', '🐝'),
  ('🌊 Oceans 50% oxygen produce karte hain jo hum breathe karte hain!', '🌊'),
  ('🔌 Standby appliances 10% electricity waste karte hain!', '🔌'),
  ('🚿 1 minute shower me 9 liters paani use hota hai!', '🚿'),
  ('📱 Ek smartphone banane me 12,000+ liters paani lagta hai!', '📱'),
  ('🌱 Bamboo world ka fastest growing plant hai - 91cm/day!', '🌱'),
  ('🦋 Amazon rainforest 20% oxygen produce karta hai!', '🦋'),
  ('💡 LED bulbs 75% kam energy use karte hain!', '💡'),
  ('🗑️ Plastic decompose hone me 500 saal lagte hain!', '🗑️'),
  ('🐘 Elephants trees ke seeds spread karne me help karte hain!', '🐘');

-- Create updated_at trigger for eco_tips
CREATE TRIGGER update_eco_tips_updated_at
  BEFORE UPDATE ON public.eco_tips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for eco_facts
CREATE TRIGGER update_eco_facts_updated_at
  BEFORE UPDATE ON public.eco_facts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();