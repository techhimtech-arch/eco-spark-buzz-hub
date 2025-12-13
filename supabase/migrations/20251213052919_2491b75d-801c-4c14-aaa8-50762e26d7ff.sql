-- Create education_topics table for dynamic content
CREATE TABLE public.education_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_hindi TEXT,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'leaf',
  gradient TEXT NOT NULL DEFAULT 'from-emerald-500 to-teal-500',
  bg_gradient TEXT NOT NULL DEFAULT 'from-emerald-500/10 to-teal-500/10',
  order_index INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.education_topics ENABLE ROW LEVEL SECURITY;

-- Anyone can view published topics
CREATE POLICY "Anyone can view published education topics"
ON public.education_topics
FOR SELECT
USING (published = true);

-- Admins can manage education topics
CREATE POLICY "Admins can manage education topics"
ON public.education_topics
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_education_topics_updated_at
BEFORE UPDATE ON public.education_topics
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default topics
INSERT INTO public.education_topics (title, title_hindi, description, content, icon, gradient, bg_gradient, order_index) VALUES
('Reduce, Reuse, Recycle', 'कम करो, दोबारा इस्तेमाल करो', 'Waste kam karo aur items ko naya life do creative recycling ke through.', '# Reduce, Reuse, Recycle

## Kya hai ye concept?
3R ka concept environmental sustainability ka foundation hai. Isse hum apni consumption habits ko sustainable bana sakte hain.

### 1. Reduce (Kam Karo)
- Zarurat se zyada mat khareedo
- Single-use plastic avoid karo
- Energy consumption kam karo

### 2. Reuse (Dobara Use Karo)
- Purane kapde donate karo
- Glass jars ko storage ke liye use karo
- Shopping bags ghar se le jaao

### 3. Recycle (Recycle Karo)
- Waste ko segregate karo
- Paper, plastic, metal alag karo
- E-waste properly dispose karo

## Benefits
- Landfill waste kam hota hai
- Natural resources bachte hain
- Carbon footprint kam hota hai', 'recycle', 'from-emerald-500 to-teal-500', 'from-emerald-500/10 to-teal-500/10', 1),

('Water Conservation', 'पानी बचाओ', 'Ghar pe paani bachane ke simple tarike seekho aur hamari sabse precious resource ko protect karo.', '# Water Conservation

## Paani Kyun Bachana Zaroori Hai?
Duniya ka sirf 2.5% paani fresh water hai, aur iska bhi bahut chhota hissa humein accessible hai.

### Ghar Pe Paani Bachane Ke Tarike

#### Bathroom Mein
- Shower time kam karo (5 min max)
- Brush karte waqt tap band rakho
- Leaking taps turant fix karo

#### Kitchen Mein
- Bartan dhone ke liye basin use karo
- Vegetables wash karne ka paani plants ko do
- RO reject water mopping ke liye use karo

#### Garden Mein
- Early morning ya evening mein watering karo
- Drip irrigation use karo
- Rainwater harvesting install karo

## Impact
- Ek dripping tap se 20,000 litres/year waste hota hai
- Short showers se 70% paani bach sakta hai', 'droplet', 'from-cyan-500 to-blue-500', 'from-cyan-500/10 to-blue-500/10', 2),

('Renewable Energy', 'नवीकरणीय ऊर्जा', 'Solar, wind aur doosri clean energy solutions explore karo sustainable future ke liye.', '# Renewable Energy

## Clean Energy Kya Hai?
Renewable energy wo energy sources hain jo naturally replenish hote hain aur environment ko harm nahi karte.

### Types of Renewable Energy

#### Solar Energy ☀️
- Rooftop solar panels
- Solar water heaters
- Solar street lights

#### Wind Energy 💨
- Wind turbines
- Offshore wind farms
- Small wind systems for homes

#### Hydro Power 💧
- Dams se electricity
- Run-of-river systems
- Micro hydro for villages

#### Biomass 🌿
- Biogas plants
- Agricultural waste se energy
- Wood pellets

## Ghar Pe Kya Kar Sakte Ho?
- Solar panels install karo
- Solar water heater lagao
- LED bulbs use karo
- Energy efficient appliances kharido

## Benefits
- Electricity bill kam
- No pollution
- Climate change se fight', 'sun', 'from-amber-500 to-orange-500', 'from-amber-500/10 to-orange-500/10', 3),

('Sustainable Living', 'टिकाऊ जीवन', 'Daily life mein eco-friendly choices banao - food se fashion aur transportation tak.', '# Sustainable Living

## Sustainable Lifestyle Kya Hai?
Aisi lifestyle jo environment ko kam se kam harm kare aur future generations ke liye resources preserve kare.

### Food Choices 🍎
- Local aur seasonal produce kharido
- Meat consumption kam karo
- Food waste avoid karo
- Organic farming support karo

### Fashion 👕
- Fast fashion avoid karo
- Quality clothes kharido jo zyada chale
- Second-hand clothing try karo
- Clothes repair karwao, throw mat karo

### Transportation 🚴
- Public transport use karo
- Carpool karo
- Short distances ke liye walk ya cycle karo
- Electric vehicles consider karo

### Home 🏠
- LED lights use karo
- Natural ventilation prefer karo
- Indoor plants lagao
- Composting shuru karo

## Small Steps, Big Impact
Har chhoti eco-friendly choice matter karti hai!', 'leaf', 'from-green-500 to-emerald-500', 'from-green-500/10 to-emerald-500/10', 4),

('Biodiversity Protection', 'जैव विविधता', 'Ecosystems aur endangered species ko protect karna kitna important hai, ye samjho.', '# Biodiversity Protection

## Biodiversity Kya Hai?
Earth pe paye jaane wale sabhi living organisms ki variety - plants, animals, bacteria sab.

### Kyun Important Hai?

#### Ecosystem Services
- Clean air aur water
- Pollination for crops
- Natural pest control
- Soil fertility

#### Human Benefits
- Food security
- Medicine sources
- Climate regulation
- Economic benefits

### Threats to Biodiversity
- Habitat destruction
- Pollution
- Climate change
- Overexploitation
- Invasive species

### Kya Kar Sakte Ho?

#### At Home
- Native plants lagao
- Bird feeders rakho
- Pesticides avoid karo
- Wildlife-friendly garden banao

#### In Community
- Tree plantation drives
- Clean-up campaigns
- Wildlife awareness
- Wetland protection

## Remember
Har species matter karti hai - ecosystem ek web hai!', 'tree-pine', 'from-lime-500 to-green-500', 'from-lime-500/10 to-green-500/10', 5),

('Clean Air Initiatives', 'स्वच्छ हवा', 'Air quality ke baare mein seekho aur apna carbon footprint kaise kam karo effectively.', '# Clean Air Initiatives

## Air Pollution Ka Problem
India duniya ke sabse polluted countries mein se ek hai. Delhi NCR mein winter smog ek serious health hazard hai.

### Sources of Air Pollution
- Vehicle emissions
- Industrial smoke
- Construction dust
- Stubble burning
- Household cooking

### Health Effects
- Respiratory diseases
- Heart problems
- Reduced life expectancy
- Children aur elderly ko zyada risk

### Apna Carbon Footprint Kaise Kam Karein?

#### Transport
- Public transport use karo
- EV consider karo
- Carpool with colleagues
- Work from home jab possible ho

#### Home
- Energy efficient appliances
- Proper insulation
- Solar energy
- LPG/electricity for cooking

#### Lifestyle
- Plant trees
- Avoid burning waste
- Reduce, reuse, recycle
- Support clean air policies

### Indoor Air Quality
- Indoor plants rakho (Money plant, Areca palm)
- Air purifiers
- Proper ventilation
- No smoking indoors

## Together hum clean air achieve kar sakte hain!', 'wind', 'from-sky-500 to-indigo-500', 'from-sky-500/10 to-indigo-500/10', 6);