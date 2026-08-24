import { useState, useEffect, useRef, useContext, createContext, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Heart, Star, MapPin, Clock, Eye, X, Menu, ChevronRight,
  ChevronDown, MessageSquare, Send, Building2, Award, Users, ArrowRight,
  Check, Share2, Phone, Mail, Instagram, Linkedin, Zap, Sparkles,
  Bot, Trash2, ExternalLink, Filter, Twitter, Globe, Plus, Minus,
  Bookmark, Home, Compass, GitCompare, TrendingUp, Quote, SlidersHorizontal
} from "lucide-react";
import { href } from "react-router";

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const DESIGNS = [
  {
    id: 1, title: "Zenith Residence", style: "Minimalist", budget: "₹45 Lakh", budgetNum: 4500000,
    location: "Bandra, Mumbai", rating: 4.9, reviews: 128, architectId: 1, featured: true,
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&h=800&fit=crop&auto=format"],
    description: "A pristine minimalist 3BHK residence that dissolves the boundary between inside and outside. Floor-to-ceiling glass panels frame curated garden views while the palette of concrete, white plaster, and warm oak creates meditative calm.",
    bedrooms: 3, bathrooms: 3, area: "2,800 sq ft", timeline: "14 months",
    tags: ["Minimalist", "Open Plan", "Pool", "Garden", "Smart Home"],
    materials: ["Polished Concrete", "Structural Glass", "White Marble", "Teak Wood", "Corten Steel"],
  },
  {
    id: 2, title: "The Glass Pavilion", style: "Contemporary", budget: "₹85 Lakh", budgetNum: 8500000,
    location: "Whitefield, Bangalore", rating: 4.8, reviews: 94, architectId: 2, featured: true,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=700&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1502005097973-6a7082348e76?w=1200&h=800&fit=crop&auto=format"],
    description: "Inspired by Philip Johnson's glass house, this contemporary pavilion floats amid a curated 1-acre garden. Double-height glass walls retract fully, turning living spaces into open-air terraces in the Bangalore weather.",
    bedrooms: 4, bathrooms: 4, area: "4,200 sq ft", timeline: "18 months",
    tags: ["Contemporary", "Glass", "Biophilic", "Double Height", "Luxury"],
    materials: ["Structural Glass", "Brushed Steel", "White Limestone", "Bamboo", "Reclaimed Teak"],
  },
  {
    id: 3, title: "Terra House", style: "Biophilic", budget: "₹65 Lakh", budgetNum: 6500000,
    location: "Assagao, Goa", rating: 4.7, reviews: 76, architectId: 4, featured: false,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=900&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1502005097973-6a7082348e76?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop&auto=format"],
    description: "A Goan retreat where architecture dissolves into landscape. Living roots and tropical planting cascade across every surface — the home grows alongside its garden, shaped by the rhythms of monsoon and sun.",
    bedrooms: 3, bathrooms: 3, area: "3,100 sq ft", timeline: "16 months",
    tags: ["Biophilic", "Tropical", "Pool", "Goa Style", "Sustainable"],
    materials: ["Laterite Stone", "Bamboo", "Reclaimed Timber", "Lime Plaster", "Copper"],
  },
  {
    id: 4, title: "Citadel Tower", style: "Brutalist", budget: "₹1.2 Crore", budgetNum: 12000000,
    location: "Greater Kailash, Delhi", rating: 4.6, reviews: 58, architectId: 3, featured: false,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1539650116574-75c0c6d44e5b?w=1200&h=800&fit=crop&auto=format"],
    description: "Raw, honest, unapologetic. Board-formed concrete rises four storeys, punctured by dramatic cantilevers and deep shadow-casting recesses. A statement residence dominating its corner plot.",
    bedrooms: 5, bathrooms: 5, area: "6,800 sq ft", timeline: "24 months",
    tags: ["Brutalist", "Concrete", "Bold", "Statement", "Urban"],
    materials: ["Board-Form Concrete", "Weathering Steel", "Smoked Glass", "Black Granite", "Industrial Steel"],
  },
  {
    id: 5, title: "Art Deco Manor", style: "Art Deco", budget: "₹95 Lakh", budgetNum: 9500000,
    location: "Koregaon Park, Pune", rating: 4.8, reviews: 87, architectId: 5, featured: true,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=700&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop&auto=format"],
    description: "Chevrons, stepped cornices, and gilded details reimagined for contemporary living. This Art Deco manor blends 1930s glamour with 21st-century sustainability — solar-integrated, net-zero ready.",
    bedrooms: 4, bathrooms: 4, area: "5,200 sq ft", timeline: "20 months",
    tags: ["Art Deco", "Heritage", "Luxury", "Gold Accents", "Garden"],
    materials: ["Limestone", "Brass", "Terrazzo", "Silk Plaster", "Aged Oak"],
  },
  {
    id: 6, title: "Forge Loft", style: "Industrial", budget: "₹55 Lakh", budgetNum: 5500000,
    location: "Lower Parel, Mumbai", rating: 4.5, reviews: 112, architectId: 1, featured: false,
    image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&h=800&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop&auto=format"],
    description: "Converted from a 1960s textile mill, Forge Loft preserves every inch of industrial heritage — exposed riveted beams, original brick, polished concrete floors — while introducing invisible modern comforts.",
    bedrooms: 2, bathrooms: 2, area: "1,900 sq ft", timeline: "12 months",
    tags: ["Industrial", "Loft", "Heritage", "Urban", "Converted"],
    materials: ["Exposed Brick", "Riveted Steel", "Polished Concrete", "Reclaimed Wood", "Matte Black Iron"],
  },
  {
    id: 7, title: "Futura Villa", style: "Futuristic", budget: "₹1.5 Crore", budgetNum: 15000000,
    location: "Jubilee Hills, Hyderabad", rating: 4.9, reviews: 63, architectId: 6, featured: true,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop&auto=format"],
    description: "Parametric curved forms, integrated photovoltaic skin, and AI-controlled climate make Futura Villa a living machine — Hadid meets Hyderabad. Every curve is load-bearing, every surface generates energy.",
    bedrooms: 5, bathrooms: 6, area: "7,500 sq ft", timeline: "28 months",
    tags: ["Futuristic", "Smart Home", "Parametric", "Sustainable", "Luxury"],
    materials: ["GFRP Panels", "Smart Glass", "Anodised Aluminium", "LED-Concrete", "Carbon Fibre"],
  },
  {
    id: 8, title: "Heritage Bungalow", style: "Colonial", budget: "₹75 Lakh", budgetNum: 7500000,
    location: "Boat Club Road, Chennai", rating: 4.7, reviews: 91, architectId: 7, featured: false,
    image: "https://images.unsplash.com/photo-1549497538-b24756bde790?w=800&h=700&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1549497538-b24756bde790?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=800&fit=crop&auto=format"],
    description: "A meticulous restoration of a 1920s colonial bungalow. Every teak column, Mangalore tile, and verandah arch preserved. Modern annexes connect seamlessly within the historic envelope.",
    bedrooms: 4, bathrooms: 3, area: "4,600 sq ft", timeline: "22 months",
    tags: ["Colonial", "Heritage", "Restoration", "Teak", "Garden"],
    materials: ["Teak", "Mangalore Tile", "Madras Terracotta", "Lime Wash", "Brass Hardware"],
  },
  {
    id: 9, title: "Cascade Home", style: "Contemporary", budget: "₹90 Lakh", budgetNum: 9000000,
    location: "Candolim, Goa", rating: 4.8, reviews: 69, architectId: 4, featured: false,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=900&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1502005097973-6a7082348e76?w=1200&h=800&fit=crop&auto=format"],
    description: "Terraced into a gentle hillside, Cascade Home steps toward the Arabian Sea. Each floor commands a distinct view — jungle canopy, silver horizon, crashing surf — unified by white render and natural stone.",
    bedrooms: 4, bathrooms: 4, area: "3,800 sq ft", timeline: "18 months",
    tags: ["Contemporary", "Sea View", "Terraced", "Pool", "Goa"],
    materials: ["White Render", "Basalt Stone", "Marine-Grade Teak", "Mosaic Tile", "Bronze"],
  },
  {
    id: 10, title: "Minimal Cube", style: "Minimalist", budget: "₹48 Lakh", budgetNum: 4800000,
    location: "Sarjapur, Bangalore", rating: 4.6, reviews: 104, architectId: 2, featured: false,
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop&auto=format"],
    description: "Pure geometry, radical restraint. A single perfect cube houses a complete 3BHK within. No ornament, no excess: just proportion, light, and the quiet luxury of every deliberate line.",
    bedrooms: 3, bathrooms: 2, area: "2,400 sq ft", timeline: "11 months",
    tags: ["Minimalist", "Geometric", "Compact", "Budget-Friendly"],
    materials: ["White Cement Plaster", "Kota Stone", "Clear Glass", "Mild Steel", "Bamboo"],
  },
  {
    id: 11, title: "Sky Garden", style: "Biophilic", budget: "₹1.1 Crore", budgetNum: 11000000,
    location: "Golf Links, Delhi", rating: 4.7, reviews: 73, architectId: 3, featured: false,
    image: "https://images.unsplash.com/photo-1502005097973-6a7082348e76?w=800&h=800&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1502005097973-6a7082348e76?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop&auto=format"],
    description: "A vertical garden in the heart of Delhi. Sky Garden stacks living planting terraces at every floor level — 800+ plant species cool the home naturally and create a thriving urban ecosystem.",
    bedrooms: 5, bathrooms: 5, area: "6,200 sq ft", timeline: "22 months",
    tags: ["Biophilic", "Vertical Garden", "Sustainable", "Delhi", "Luxury"],
    materials: ["Green Wall System", "Rammed Earth", "Recycled Steel", "Natural Stone", "Teak"],
  },
  {
    id: 12, title: "Steel Canvas", style: "Industrial", budget: "₹60 Lakh", budgetNum: 6000000,
    location: "Salt Lake, Kolkata", rating: 4.5, reviews: 82, architectId: 8, featured: false,
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d44e5b?w=800&h=700&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1539650116574-75c0c6d44e5b?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&auto=format"],
    description: "A former salt godown reimagined as a live-work dwelling. The exposed steel skeleton becomes the architecture — no cladding, no concealment. Suspended pods float within the industrial shell.",
    bedrooms: 3, bathrooms: 3, area: "3,500 sq ft", timeline: "15 months",
    tags: ["Industrial", "Adaptive Reuse", "Mezzanine", "Kolkata", "Loft"],
    materials: ["Exposed Steel", "Polished Concrete", "Wire Glass", "Cork", "Reclaimed Timber"],
  },
];

const ARCHITECTS = [
  {
    id: 1, name: "Arjun Mehta", title: "Principal Architect", firm: "Mehta Design Studio",
    location: "Mumbai", experience: 18, rating: 4.9, reviews: 156, projects: 87,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&auto=format",
    specialties: ["Minimalist", "Industrial", "Adaptive Reuse"],
    bio: "Arjun Mehta trained at the AA London and returned to Mumbai with a singular obsession: honest materials. His 18-year practice has redefined luxury residential architecture in Maharashtra — stripping away ornament to reveal the beauty of structure.",
    awards: ["AIA Young Architect 2014", "Inside World Festival 2019", "Dezeen Award 2022"],
    startingBudget: "₹40 Lakh", phone: "+91 98765 43210", email: "arjun@mehtadesign.in",
    website: "mehtadesign.in", instagram: "@arjun.mehta.arch", portfolioIds: [1, 6],
  },
  {
    id: 2, name: "Priya Sharma", title: "Creative Director", firm: "Studio Priya",
    location: "Bangalore", experience: 12, rating: 4.8, reviews: 124, projects: 54,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&auto=format",
    specialties: ["Contemporary", "Minimalist", "Sustainable"],
    bio: "Priya Sharma is one of India's most sought-after residential architects under 40. Her work in Bangalore has established a vocabulary of quiet luxury that feels deeply local yet internationally relevant.",
    awards: ["Forbes India 30 Under 30 2018", "NDTV Design Award 2021", "IIID Best Residential 2023"],
    startingBudget: "₹45 Lakh", phone: "+91 98765 43211", email: "priya@studiopriya.in",
    website: "studiopriya.in", instagram: "@priya.sharma.architect", portfolioIds: [2, 10],
  },
  {
    id: 3, name: "Rajiv Nair", title: "Founding Partner", firm: "Nair & Associates",
    location: "Delhi", experience: 22, rating: 4.7, reviews: 198, projects: 112,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&auto=format",
    specialties: ["Brutalist", "Biophilic", "Institutional"],
    bio: "Delhi-based Rajiv Nair built his reputation on institutional commissions before turning to high-end residential. His Citadel Tower caused a national conversation about Brutalism's place in Indian cities.",
    awards: ["Pritzker Jury Citation 2020", "Indian Architect & Builder Award 2019", "RIBA International Award 2023"],
    startingBudget: "₹75 Lakh", phone: "+91 98765 43212", email: "rajiv@nairassociates.in",
    website: "nairassociates.in", instagram: "@rajiv.nair.arch", portfolioIds: [4, 11],
  },
  {
    id: 4, name: "Ananya Krishnan", title: "Founder & Lead Designer", firm: "Kri Studio",
    location: "Goa", experience: 8, rating: 4.8, reviews: 89, projects: 34,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&auto=format",
    specialties: ["Biophilic", "Tropical", "Contemporary"],
    bio: "A Harvard GSD graduate, Ananya Krishnan returned to design houses that breathe — biophilic, cross-ventilated, deeply conscious of the coastal landscape they inhabit.",
    awards: ["Architectural Digest Top 50 2022", "Wallpaper* Award 2023", "Green Building Award 2022"],
    startingBudget: "₹55 Lakh", phone: "+91 98765 43213", email: "ananya@kri.studio",
    website: "kri.studio", instagram: "@ananya.krishnan.arch", portfolioIds: [3, 9],
  },
  {
    id: 5, name: "Vikram Patel", title: "Senior Architect", firm: "Patel Heritage Studio",
    location: "Pune", experience: 15, rating: 4.6, reviews: 143, projects: 68,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&auto=format",
    specialties: ["Art Deco", "Heritage", "Luxury"],
    bio: "Vikram Patel is the architect collectors call when they want history treated with reverence. His Art Deco Manor in Koregaon Park has become one of Pune's most photographed private houses.",
    awards: ["UNESCO Asia-Pacific Heritage Award 2020", "INTACH Award 2019", "Condé Nast India Award 2022"],
    startingBudget: "₹60 Lakh", phone: "+91 98765 43214", email: "vikram@patelheritagestudio.in",
    website: "patelheritagestudio.in", instagram: "@vikram.patel.arch", portfolioIds: [5],
  },
  {
    id: 6, name: "Sonal Agarwal", title: "Design Principal", firm: "Agarwal Futura",
    location: "Hyderabad", experience: 10, rating: 4.9, reviews: 77, projects: 29,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&auto=format",
    specialties: ["Futuristic", "Parametric", "Smart Homes"],
    bio: "A computational design specialist trained at TU Delft, Sonal uses parametric tools to generate organic forms impossible to achieve by hand — then executes them with surgical precision.",
    awards: ["Fast Company Innovation Award 2023", "A+Awards Residential 2022", "CII Smart Home Award 2023"],
    startingBudget: "₹1 Crore", phone: "+91 98765 43215", email: "sonal@agarwalfutura.in",
    website: "agarwalfutura.in", instagram: "@sonal.agarwal.arch", portfolioIds: [7],
  },
  {
    id: 7, name: "Dev Rajan", title: "Conservation Architect", firm: "Rajan Conservation",
    location: "Chennai", experience: 20, rating: 4.7, reviews: 131, projects: 91,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&auto=format",
    specialties: ["Colonial", "Heritage", "Restoration"],
    bio: "Dev Rajan is India's foremost colonial conservation architect. His methodology — document everything, disturb nothing, restore only what you understand — has saved dozens of Tamil Nadu's heritage buildings.",
    awards: ["INTACH Conservation Award 2015 & 2019", "Government of India Heritage Award 2021", "AIA International Award 2022"],
    startingBudget: "₹50 Lakh", phone: "+91 98765 43216", email: "dev@rajanconservation.in",
    website: "rajanconservation.in", instagram: "@dev.rajan.arch", portfolioIds: [8],
  },
  {
    id: 8, name: "Meera Kapoor", title: "Architect & Urban Designer", firm: "Kapoor Urban Studio",
    location: "Kolkata", experience: 7, rating: 4.5, reviews: 68, projects: 22,
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&auto=format",
    specialties: ["Industrial", "Adaptive Reuse", "Urban"],
    bio: "Meera Kapoor has made adaptive reuse her mission — transforming Kolkata's crumbling industrial heritage into desirable contemporary living. Steel Canvas is the city's most talked-about residential renovation in a decade.",
    awards: ["Young Gun Award 2022", "Urban Design Award Kolkata 2023", "Housing India Award 2023"],
    startingBudget: "₹35 Lakh", phone: "+91 98765 43217", email: "meera@kapoorurstudio.in",
    website: "kapoorurbanstudio.in", instagram: "@meera.kapoor.arch", portfolioIds: [12],
  },
];

const TESTIMONIALS = [
  { id: 1, name: "Rohan Malhotra", location: "Bandra, Mumbai", rating: 5, project: "Zenith Residence",
    text: "ArchVision AI changed how we thought about our dream home. We weren't looking for an architect — we were looking for a vision. We found both.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format" },
  { id: 2, name: "Deepika Rao", location: "Koregaon Park, Pune", rating: 5, project: "Art Deco Manor",
    text: "I had no idea how to describe what I wanted. The AI recommendation understood me before I understood myself. Truly magical.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format" },
  { id: 3, name: "Karan Mehta", location: "Jubilee Hills, Hyderabad", rating: 5, project: "Futura Villa",
    text: "The compare feature helped us choose between two incredible architects. We saved ₹20 lakh in the process by finding our perfect match.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format" },
];

const STYLE_TAGS = ["All", "Minimalist", "Contemporary", "Biophilic", "Brutalist", "Art Deco", "Industrial", "Futuristic", "Colonial"];

const FAQS = [
  { q: "How does ArchVision AI match me with architects?", a: "Our AI analyses your style preferences, budget, location, and project scope to surface architects whose portfolio and expertise align precisely with your vision — not just proximity." },
  { q: "Is it free to browse designs and architect profiles?", a: "Absolutely. All design exploration, AI recommendations, and architect browsing are free forever. We only charge architects for enhanced listing features." },
  { q: "Can I contact architects directly through the platform?", a: "Yes. Every architect profile includes direct contact options. We encourage site visits and consultations before committing." },
  { q: "How current are the design portfolios?", a: "Architects update their portfolios in real time. Every project displays its completion date so you always know how recent the work is." },
  { q: "What if I don't know my architectural style?", a: "Browse designs by mood, filter by budget, and let the AI recommendation chat guide you to your vision through a simple conversation." },
];

const AI_PROMPTS = [
  "I want a minimalist 3BHK villa with large windows under ₹70 lakh",
  "Show me biophilic homes in Goa under ₹1 crore",
  "Contemporary house with pool in Bangalore, budget ₹80 lakh",
  "Industrial loft conversion in metro city under ₹60 lakh",
];

// ─────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────

const AppCtx = createContext<any>(null);
const useApp = () => useContext(AppCtx);

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────

function ToastNotification() {
  const { toast, setToast } = useApp();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast, setToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl"
          style={{ background: "rgba(30,41,59,0.95)" }}
        >
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
            toast.type === "success" ? "bg-emerald-500/20" : toast.type === "error" ? "bg-red-500/20" : "bg-sky-500/20"
          )}>
            <Check size={12} className={cn(
              toast.type === "success" ? "text-emerald-400" : toast.type === "error" ? "text-red-400" : "text-sky-400"
            )} />
          </div>
          <span className="text-sm text-slate-200">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-slate-500 hover:text-slate-300 ml-1">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────

function Navbar({ currentPage }: { currentPage: string }) {
  const { navigate, favorites } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Explore", page: "explore", icon: Compass },
    { label: "AI Match", page: "ai", icon: Bot },
    { label: "Compare", page: "compare", icon: GitCompare },
    { label: "About", page: "about", icon: null },
    { label: "Contact", page: "contact", icon: null },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      scrolled ? "backdrop-blur-xl border-b border-white/8" : ""
    )} style={{ background: scrolled ? "rgba(15,23,42,0.92)" : "transparent" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate("home")} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-sky-400 rounded-lg flex items-center justify-center shadow-lg shadow-sky-400/30">
            <Building2 size={15} className="text-[#0F172A]" />
          </div>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-white font-semibold text-lg tracking-tight">
            ArchVision<span className="text-sky-400"> AI</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-7">
          {links.map(l => (
            <button key={l.page} onClick={() => navigate(l.page)}
              className={cn("text-sm transition-colors duration-200",
                currentPage === l.page ? "text-sky-400" : "text-slate-400 hover:text-white")}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("favorites")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-white text-sm transition-colors rounded-lg hover:bg-white/5">
            <Heart size={15} className={favorites.length ? "fill-red-400 text-red-400" : ""} />
            <span className="hidden md:block">Saved</span>
            {favorites.length > 0 && (
              <span className="w-4 h-4 bg-sky-400 rounded-full text-[10px] text-[#0F172A] font-bold flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>
          <button onClick={() => navigate("contact")}
            className="hidden sm:block px-4 py-2 bg-sky-400 hover:bg-sky-300 text-[#0F172A] text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-sky-400/25">
            Get Started
          </button>
          <button className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setOpen(v => !v)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-b border-white/8"
            style={{ background: "rgba(15,23,42,0.98)", backdropFilter: "blur(20px)" }}>
            <div className="px-6 py-5 space-y-1">
              {links.map(l => (
                <button key={l.page} onClick={() => { navigate(l.page); setOpen(false); }}
                  className={cn("w-full text-left py-3 px-3 rounded-xl text-sm transition-colors",
                    currentPage === l.page ? "text-sky-400 bg-sky-400/10" : "text-slate-300 hover:text-white hover:bg-white/5")}>
                  {l.label}
                </button>
              ))}
              <button onClick={() => { navigate("favorites"); setOpen(false); }}
                className="w-full text-left py-3 px-3 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                Saved Designs {favorites.length > 0 && `(${favorites.length})`}
              </button>
              <div className="pt-2">
                <button onClick={() => { navigate("contact"); setOpen(false); }}
                  className="w-full py-2.5 bg-sky-400 text-[#0F172A] font-semibold text-sm rounded-xl">
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────

function Footer() {
  const { navigate } = useApp();
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-white/8 bg-[#0A1628]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-1">
            <button onClick={() => navigate("home")} className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-sky-400 rounded-lg flex items-center justify-center">
                <Building2 size={15} className="text-[#0F172A]" />
              </div>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-white font-semibold text-lg">
                ArchVision AI
              </span>
            </button>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              Discover architecture. Find architects. Build your vision.
            </p>
            <div className="flex gap-3">
              {[
                {
                Icon: Twitter,
                href: "#",
                }, {
                Icon: Instagram,
                href: "https://www.instagram.com/_brain._.less_/?hl=en",  
                }, { 
                Icon: Linkedin,
                href: "https://www.linkedin.com/in/priyanshu-ranjan-mistry-9983842a1/",
                },
               ].map(({ Icon, href }, i) => (
                  <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-sky-400/20 border border-white/8 hover:border-sky-400/30 flex items-center justify-center text-slate-500 hover:text-sky-400 transition-all duration-200"
                  >
                    <Icon size={15} />
                  </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white font-medium text-sm mb-4">Explore</p>
            <div className="space-y-2.5">
              {[["Designs", "explore"], ["Architects", "explore"], ["AI Match", "ai"], ["Compare", "compare"]].map(([label, page]) => (
                <button key={label} onClick={() => navigate(page as string)}
                  className="block text-slate-500 hover:text-sky-400 text-sm transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white font-medium text-sm mb-4">Company</p>
            <div className="space-y-2.5">
              {[["About Us", "about"], ["Contact", "contact"], ["Careers", "contact"], ["Press", "contact"]].map(([label, page]) => (
                <button key={label} onClick={() => navigate(page as string)}
                  className="block text-slate-500 hover:text-sky-400 text-sm transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white font-medium text-sm mb-4">Newsletter</p>
            <p className="text-slate-500 text-sm mb-4">Get weekly design inspiration delivered to your inbox.</p>
            <div className="flex gap-2">
              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" type="email"
                className="flex-1 px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-400/50 transition-colors" />
              <button onClick={() => setEmail("")}
                className="px-3 py-2.5 bg-sky-400 hover:bg-sky-300 text-[#0F172A] rounded-xl transition-colors flex-shrink-0">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">© 2025 ArchVision AI. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(item => (
              <a key={item} href="#" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// FLOATING ACTION BUTTON
// ─────────────────────────────────────────────

function FAB() {
  const { navigate } = useApp();
  const [expanded, setExpanded] = useState(false);

  const actions = [
    { icon: Bot, label: "AI Match", page: "ai", color: "bg-violet-500" },
    { icon: Compass, label: "Explore", page: "explore", color: "bg-emerald-500" },
    { icon: GitCompare, label: "Compare", page: "compare", color: "bg-amber-500" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-3">
      <AnimatePresence>
        {expanded && actions.map((a, i) => (
          <motion.button key={a.page}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => { navigate(a.page); setExpanded(false); }}
            className={cn("flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-white text-sm font-medium shadow-xl", a.color)}>
            <a.icon size={15} />
            {a.label}
          </motion.button>
        ))}
      </AnimatePresence>
      <motion.button whileTap={{ scale: 0.92 }}
        onClick={() => setExpanded(v => !v)}
        className="w-14 h-14 bg-sky-400 hover:bg-sky-300 rounded-2xl flex items-center justify-center shadow-xl shadow-sky-400/30 transition-colors">
        <motion.div animate={{ rotate: expanded ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus size={22} className="text-[#0F172A]" />
        </motion.div>
      </motion.button>
    </div>
  );
}

// ─────────────────────────────────────────────
// DESIGN CARD
// ─────────────────────────────────────────────

function DesignCard({ design }: { design: any }) {
  const { navigate, favorites, toggleFavorite, showToast } = useApp();
  const isFav = favorites.includes(design.id);

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative rounded-2xl overflow-hidden border border-white/8 bg-[#1E293B] cursor-pointer">
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <img src={design.image} alt={design.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-transparent to-transparent" />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={() => navigate("design", design.id)}
            className="px-5 py-2.5 backdrop-blur-md bg-white/15 border border-white/25 text-white text-sm rounded-full hover:bg-white/25 transition-all shadow-xl">
            <span className="flex items-center gap-2"><Eye size={14} /> View Details</span>
          </button>
        </div>

        {/* Save button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(design.id); showToast(isFav ? "Removed from saved" : "Saved!", isFav ? "info" : "success"); }}
          className={cn(
            "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm border",
            isFav
              ? "bg-red-500/20 border-red-500/40 opacity-100"
              : "bg-black/40 border-white/20 opacity-0 group-hover:opacity-100"
          )}>
          <Heart size={14} className={isFav ? "fill-red-400 text-red-400" : "text-white"} />
        </button>

        {/* Style badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-xs rounded-full backdrop-blur-md bg-sky-400/15 border border-sky-400/30 text-sky-300">
            {design.style}
          </span>
        </div>
      </div>

      <div className="p-4" onClick={() => navigate("design", design.id)}>
        <h3 className="text-white font-semibold text-sm mb-1.5 group-hover:text-sky-400 transition-colors">
          {design.title}
        </h3>
        <div className="flex items-center gap-1 mb-3">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          <span className="text-amber-400 text-xs font-medium">{design.rating}</span>
          <span className="text-slate-600 text-xs">({design.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <MapPin size={11} /><span>{design.location}</span>
          </div>
          <span className="text-sky-400 text-xs font-semibold">{design.budget}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// ARCHITECT CARD
// ─────────────────────────────────────────────

function ArchitectCard({ architect }: { architect: any }) {
  const { navigate } = useApp();

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.25 }}
      onClick={() => navigate("architect", architect.id)}
      className="group bg-[#1E293B] border border-white/8 rounded-2xl overflow-hidden cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <img src={architect.image} alt={architect.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-[#1E293B]/20 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <div className="flex gap-1.5">
            {architect.specialties.slice(0, 2).map((s: string) => (
              <span key={s} className="px-2 py-0.5 text-[10px] bg-white/10 backdrop-blur-sm border border-white/15 text-slate-300 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold mb-0.5 group-hover:text-sky-400 transition-colors">{architect.name}</h3>
        <p className="text-slate-500 text-xs mb-3">{architect.firm} · {architect.location}</p>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-amber-400">
            <Star size={11} className="fill-amber-400" />
            <span className="font-medium">{architect.rating}</span>
            <span className="text-slate-600">({architect.reviews})</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>{architect.experience}y exp</span>
            <span>{architect.projects} projects</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─────────────────────────────────────────────
// PAGE TRANSITION WRAPPER
// ─────────────────────────────────────────────

function PageWrap({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────

function Landing() {
  const { navigate } = useApp();
  const [query, setQuery] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const suggestions = ["Minimalist villa in Mumbai", "Biophilic home in Goa", "Contemporary apartment Bangalore", "Industrial loft Delhi"];

  const filteredSuggestions = query.length > 0
    ? suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  const handleSearch = () => {
    if (query.trim()) navigate("explore");
    else navigate("explore");
  };

  return (
    <PageWrap>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&h=1080&fit=crop&auto=format"
            alt="Modern architecture"
            className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.93) 0%, rgba(15,23,42,0.75) 50%, rgba(15,23,42,0.88) 100%)" }} />
          {/* Animated glow */}
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(circle, #38BDF8, transparent)" }} />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl"
            style={{ background: "radial-gradient(circle, #8B5CF6, transparent)" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-sky-400/25 bg-sky-400/8 text-sky-400 text-sm">
              <Sparkles size={14} />
              <span>AI-powered architectural discovery</span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Discover Architecture,<br />
            <span className="text-sky-400">Find Your Architect</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Browse extraordinary architectural designs first. Let the work speak, then meet the mind behind it.
          </motion.p>

          {/* Search bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="relative max-w-2xl mx-auto mb-4">
            <div className={cn(
              "flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all duration-300",
              searchFocus ? "border-sky-400/50 shadow-xl shadow-sky-400/15" : "border-white/12",
              "backdrop-blur-xl"
            )} style={{ background: "rgba(30,41,59,0.85)" }}>
              <Search size={18} className="text-slate-500 flex-shrink-0" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search styles, locations, budgets..."
                className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm" />
              <button onClick={handleSearch}
                className="px-5 py-2.5 bg-sky-400 hover:bg-sky-300 text-[#0F172A] text-sm font-semibold rounded-xl transition-all duration-200 flex-shrink-0">
                Search
              </button>
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {searchFocus && filteredSuggestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/10 overflow-hidden z-20"
                  style={{ background: "rgba(15,23,42,0.97)", backdropFilter: "blur(20px)" }}>
                  {filteredSuggestions.map((s, i) => (
                    <button key={i} onMouseDown={() => { setQuery(s); navigate("explore"); }}
                      className="w-full text-left px-5 py-3 text-sm text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors">
                      <Search size={13} className="text-slate-600" />
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600">
            <span>Trending:</span>
            {["Minimalist", "Biophilic", "Industrial", "Art Deco"].map(tag => (
              <button key={tag} onClick={() => navigate("explore")}
                className="text-slate-400 hover:text-sky-400 transition-colors underline underline-offset-2">{tag}</button>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600">
          <span className="text-xs">Scroll to explore</span>
          <ChevronDown size={16} />
        </motion.div>
      </section>

      {/* STATS */}
      <section className="py-16 border-y border-white/6" style={{ background: "rgba(30,41,59,0.4)" }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Designs", target: 2400, suffix: "+", Icon: Building2 },
            { label: "Architects", target: 340, suffix: "+", Icon: Users },
            { label: "Happy Clients", target: 8900, suffix: "+", Icon: Heart },
            { label: "Cities", target: 47, suffix: "", Icon: MapPin },
          ].map(({ label, target, suffix, Icon }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-2 text-sky-400 mb-2">
                <Icon size={18} />
              </div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                className="text-3xl font-bold text-white mb-1">
                <AnimatedCounter target={target} suffix={suffix} />
              </div>
              <div className="text-slate-500 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TRENDING STYLES */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={18} className="text-sky-400" />
            <span className="text-sky-400 text-sm font-medium uppercase tracking-widest">Trending Now</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl font-bold text-white mb-8">Popular Styles This Season</h2>
        </motion.div>

        <div className="flex flex-wrap gap-3">
          {[
            { style: "Minimalist", count: 487, color: "from-slate-500/20 to-slate-600/10" },
            { style: "Contemporary", count: 342, color: "from-sky-500/20 to-sky-600/10" },
            { style: "Biophilic", count: 298, color: "from-emerald-500/20 to-emerald-600/10" },
            { style: "Industrial", count: 215, color: "from-amber-500/20 to-amber-600/10" },
            { style: "Brutalist", count: 167, color: "from-red-500/20 to-red-600/10" },
            { style: "Art Deco", count: 134, color: "from-violet-500/20 to-violet-600/10" },
            { style: "Futuristic", count: 98, color: "from-cyan-500/20 to-cyan-600/10" },
            { style: "Colonial", count: 87, color: "from-rose-500/20 to-rose-600/10" },
          ].map(({ style, count, color }, i) => (
            <motion.button key={style} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("explore")}
              className={cn("flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-white/10 bg-gradient-to-br", color, "text-white hover:border-sky-400/40 transition-all duration-200")}>
              <span className="font-medium text-sm">{style}</span>
              <span className="text-xs text-slate-500 font-mono">{count}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* FEATURED DESIGNS */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles size={18} className="text-sky-400" />
              <span className="text-sky-400 text-sm font-medium uppercase tracking-widest">Curated Picks</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-3xl font-bold text-white">Featured Designs</h2>
          </motion.div>
          <button onClick={() => navigate("explore")}
            className="hidden sm:flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm transition-colors">
            View all <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESIGNS.filter(d => d.featured).map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <DesignCard design={d} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* POPULAR ARCHITECTS */}
      <section className="py-20" style={{ background: "rgba(30,41,59,0.3)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-2">
                <Award size={18} className="text-sky-400" />
                <span className="text-sky-400 text-sm font-medium uppercase tracking-widest">Top Rated</span>
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                className="text-3xl font-bold text-white">Popular Architects</h2>
            </motion.div>
            <button onClick={() => navigate("explore")}
              className="hidden sm:flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm transition-colors">
              All architects <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ARCHITECTS.slice(0, 4).map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <ArchitectCard architect={a} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Quote size={18} className="text-sky-400" />
            <span className="text-sky-400 text-sm font-medium uppercase tracking-widest">Client Stories</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl font-bold text-white">What Our Users Say</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-white/8 bg-[#1E293B]/60 backdrop-blur-sm">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={13} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-white text-sm font-medium">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.location} · {t.project}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI CTA */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center border border-sky-400/20">
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(139,92,246,0.08) 100%)" }} />
          <div className="absolute inset-0 border border-sky-400/15 rounded-3xl" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-sky-400/15 border border-sky-400/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bot size={24} className="text-sky-400" />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tell Us Your Dream Home
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-8 text-lg">
              Our AI understands style, space, and budget — and finds the perfect architect for your vision in seconds.
            </p>
            <button onClick={() => navigate("ai")}
              className="px-8 py-4 bg-sky-400 hover:bg-sky-300 text-[#0F172A] font-semibold rounded-2xl transition-all duration-200 inline-flex items-center gap-3 shadow-xl shadow-sky-400/25 text-sm">
              <Sparkles size={16} />
              Try AI Recommendation
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="py-20 max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl font-bold text-white mb-3">Frequently Asked</h2>
          <p className="text-slate-500">Everything you need to know about ArchVision AI</p>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/8 overflow-hidden bg-[#1E293B]/40">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/3 transition-colors">
                <span className="text-white text-sm font-medium pr-4">{faq.q}</span>
                <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                    <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/6 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// EXPLORE PAGE
// ─────────────────────────────────────────────

function Explore() {
  const { navigate } = useApp();
  const [activeStyle, setActiveStyle] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [budgetMax, setBudgetMax] = useState(15000000);
  const [searchQ, setSearchQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewTab, setViewTab] = useState<"designs" | "architects">("designs");

  const filtered = DESIGNS
    .filter(d => activeStyle === "All" || d.style === activeStyle)
    .filter(d => d.budgetNum <= budgetMax)
    .filter(d => d.title.toLowerCase().includes(searchQ.toLowerCase()) || d.location.toLowerCase().includes(searchQ.toLowerCase()))
    .sort((a, b) => sortBy === "rating" ? b.rating - a.rating : sortBy === "budget-low" ? a.budgetNum - b.budgetNum : b.budgetNum - a.budgetNum);

  const filteredArchitects = ARCHITECTS
    .filter(a => activeStyle === "All" || a.specialties.includes(activeStyle))
    .filter(a => a.name.toLowerCase().includes(searchQ.toLowerCase()) || a.location.toLowerCase().includes(searchQ.toLowerCase()));

  const budgetLabel = budgetMax >= 10000000 ? `₹${(budgetMax / 10000000).toFixed(1)} Cr` :
    `₹${(budgetMax / 100000).toFixed(0)} Lakh`;

  return (
    <PageWrap>
      <div className="pt-16 min-h-screen">
        {/* Header */}
        <div className="border-b border-white/8 px-6 py-6" style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(20px)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
              <div>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white">
                  {viewTab === "designs" ? "Explore Designs" : "Browse Architects"}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {viewTab === "designs" ? `${filtered.length} designs found` : `${filteredArchitects.length} architects found`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* View toggle */}
                <div className="flex rounded-xl overflow-hidden border border-white/10">
                  <button onClick={() => setViewTab("designs")}
                    className={cn("px-4 py-2 text-sm transition-colors", viewTab === "designs" ? "bg-sky-400 text-[#0F172A] font-medium" : "text-slate-400 hover:text-white")}>
                    Designs
                  </button>
                  <button onClick={() => setViewTab("architects")}
                    className={cn("px-4 py-2 text-sm transition-colors", viewTab === "architects" ? "bg-sky-400 text-[#0F172A] font-medium" : "text-slate-400 hover:text-white")}>
                    Architects
                  </button>
                </div>
                <button onClick={() => setShowFilters(v => !v)}
                  className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all", showFilters ? "border-sky-400/50 text-sky-400 bg-sky-400/10" : "border-white/10 text-slate-400 hover:text-white")}>
                  <SlidersHorizontal size={14} />
                  Filters
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 mb-4">
              <Search size={16} className="text-slate-500" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder={viewTab === "designs" ? "Search by style, location..." : "Search architects..."}
                className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 outline-none" />
              {searchQ && <button onClick={() => setSearchQ("")}><X size={14} className="text-slate-500" /></button>}
            </div>

            {/* Style filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {STYLE_TAGS.map(s => (
                <button key={s} onClick={() => setActiveStyle(s)}
                  className={cn("px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border flex-shrink-0",
                    activeStyle === s ? "bg-sky-400 text-[#0F172A] border-sky-400" : "border-white/10 text-slate-400 hover:text-white hover:border-white/25")}>
                  {s}
                </button>
              ))}
            </div>

            {/* Filter panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-xs font-medium block mb-2">Max Budget: {budgetLabel}</label>
                      <input type="range" min={3500000} max={15000000} step={500000}
                        value={budgetMax} onChange={e => setBudgetMax(Number(e.target.value))}
                        className="w-full accent-sky-400" />
                      <div className="flex justify-between text-xs text-slate-600 mt-1">
                        <span>₹35 Lakh</span><span>₹1.5 Crore</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs font-medium block mb-2">Sort by</label>
                      <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white outline-none">
                        <option value="rating">Highest Rated</option>
                        <option value="budget-low">Budget: Low to High</option>
                        <option value="budget-high">Budget: High to Low</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {viewTab === "designs" ? (
            filtered.length > 0 ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                {filtered.map(d => (
                  <div key={d.id} className="break-inside-avoid mb-6">
                    <DesignCard design={d} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500">
                <Building2 size={40} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">No designs match your filters</p>
                <button onClick={() => { setActiveStyle("All"); setBudgetMax(15000000); setSearchQ(""); }}
                  className="mt-4 text-sky-400 text-sm hover:underline">Clear filters</button>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArchitects.map(a => <ArchitectCard key={a.id} architect={a} />)}
            </div>
          )}
        </div>
      </div>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// DESIGN DETAILS PAGE
// ─────────────────────────────────────────────

function DesignDetails({ designId }: { designId: number | null }) {
  const { navigate, favorites, toggleFavorite, showToast } = useApp();
  const design = DESIGNS.find(d => d.id === designId) || DESIGNS[0];
  const architect = ARCHITECTS.find(a => a.id === design.architectId)!;
  const similar = DESIGNS.filter(d => d.style === design.style && d.id !== design.id).slice(0, 3);
  const [activeImg, setActiveImg] = useState(0);
  const isFav = favorites.includes(design.id);

  useEffect(() => { setActiveImg(0); }, [designId]);

  return (
    <PageWrap>
      <div className="pt-16 min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-sm text-slate-500">
          <button onClick={() => navigate("home")} className="hover:text-sky-400 transition-colors">Home</button>
          <ChevronRight size={14} />
          <button onClick={() => navigate("explore")} className="hover:text-sky-400 transition-colors">Explore</button>
          <ChevronRight size={14} />
          <span className="text-white">{design.title}</span>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Gallery */}
            <div className="lg:col-span-2">
              <div className="relative rounded-3xl overflow-hidden mb-4 bg-slate-800" style={{ aspectRatio: "16/10" }}>
                <motion.img key={activeImg} src={design.gallery[activeImg]} alt={design.title}
                  initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover" />
                <button
                  onClick={() => { toggleFavorite(design.id); showToast(isFav ? "Removed from saved" : "Saved to favorites!", isFav ? "info" : "success"); }}
                  className={cn("absolute top-4 right-4 w-11 h-11 rounded-2xl flex items-center justify-center backdrop-blur-md border transition-all",
                    isFav ? "bg-red-500/20 border-red-500/40" : "bg-black/30 border-white/20")}>
                  <Heart size={18} className={isFav ? "fill-red-400 text-red-400" : "text-white"} />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1.5 text-xs rounded-full backdrop-blur-md bg-sky-400/15 border border-sky-400/30 text-sky-300">
                    {design.style}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3">
                {design.gallery.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={cn("w-20 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0",
                      activeImg === i ? "border-sky-400" : "border-white/10 opacity-50 hover:opacity-80")}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Description */}
              <div className="mt-8">
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white mb-4">About This Project</h2>
                <p className="text-slate-400 leading-relaxed">{design.description}</p>
              </div>

              {/* Specs */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Bedrooms", value: design.bedrooms },
                  { label: "Bathrooms", value: design.bathrooms },
                  { label: "Built Area", value: design.area },
                  { label: "Timeline", value: design.timeline },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 rounded-2xl bg-[#1E293B] border border-white/8 text-center">
                    <div style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-xl font-bold text-white mb-1">{value}</div>
                    <div className="text-slate-500 text-xs">{label}</div>
                  </div>
                ))}
              </div>

              {/* Materials */}
              <div className="mt-8">
                <h3 className="text-white font-semibold mb-4">Materials Used</h3>
                <div className="flex flex-wrap gap-2">
                  {design.materials.map(m => (
                    <span key={m} className="px-3 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-slate-300">{m}</span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-4">Style Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {design.tags.map(t => (
                    <span key={t} className="px-3 py-1.5 text-xs rounded-full bg-sky-400/10 border border-sky-400/20 text-sky-300">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Info panel */}
            <div className="space-y-5">
              <div>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-white mb-2">{design.title}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Star size={14} className="fill-amber-400" />
                    <span className="font-semibold">{design.rating}</span>
                    <span className="text-slate-500 text-sm">({design.reviews} reviews)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                  <MapPin size={14} /><span>{design.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                  <Clock size={14} /><span>Timeline: {design.timeline}</span>
                </div>
              </div>

              {/* Budget */}
              <div className="p-5 rounded-2xl bg-sky-400/8 border border-sky-400/20">
                <p className="text-slate-400 text-xs mb-1">Estimated Budget</p>
                <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-sky-400">{design.budget}</p>
              </div>

              {/* Actions */}
              <button onClick={() => navigate("architect", architect.id)}
                className="w-full py-3.5 bg-sky-400 hover:bg-sky-300 text-[#0F172A] font-semibold rounded-2xl transition-all text-sm flex items-center justify-center gap-2">
                <Users size={16} />
                View Architect Profile
              </button>
              <button
                onClick={() => { toggleFavorite(design.id); showToast(isFav ? "Removed" : "Saved!", isFav ? "info" : "success"); }}
                className={cn("w-full py-3.5 rounded-2xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                  isFav ? "border-red-500/40 text-red-400 bg-red-500/8" : "border-white/12 text-white hover:border-sky-400/40 hover:text-sky-400")}>
                <Heart size={16} className={isFav ? "fill-red-400" : ""} />
                {isFav ? "Remove from Saved" : "Save Design"}
              </button>
              <button className="w-full py-3.5 rounded-2xl border border-white/10 text-slate-400 hover:text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:border-white/25">
                <Share2 size={16} />
                Share
              </button>

              {/* Architect preview */}
              <div className="p-5 rounded-2xl bg-[#1E293B] border border-white/8">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-4">Designed by</p>
                <div className="flex items-center gap-4 mb-4">
                  <img src={architect.image} alt={architect.name} className="w-14 h-14 rounded-2xl object-cover object-top" />
                  <div>
                    <p className="text-white font-semibold">{architect.name}</p>
                    <p className="text-slate-500 text-xs">{architect.firm}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span className="text-amber-400 text-xs font-medium">{architect.rating}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => navigate("architect", architect.id)}
                  className="w-full py-2.5 border border-sky-400/30 text-sky-400 hover:bg-sky-400/10 text-sm rounded-xl transition-all">
                  View Full Profile
                </button>
              </div>
            </div>
          </div>

          {/* Similar designs */}
          {similar.length > 0 && (
            <div className="mt-16">
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white mb-6">Similar Designs</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similar.map(d => <DesignCard key={d.id} design={d} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// ARCHITECT PROFILE PAGE
// ─────────────────────────────────────────────

function ArchitectProfile({ architectId }: { architectId: number | null }) {
  const { navigate, showToast } = useApp();
  const architect = ARCHITECTS.find(a => a.id === architectId) || ARCHITECTS[0];
  const portfolio = DESIGNS.filter(d => architect.portfolioIds.includes(d.id));

  return (
    <PageWrap>
      <div className="pt-16 min-h-screen">
        {/* Hero */}
        <div className="relative h-64 overflow-hidden">
          <img src={portfolio[0]?.image || "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=400&fit=crop&auto=format"}
            alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F172A]/50 to-[#0F172A]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-20 relative">
          {/* Profile header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-10">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#0F172A] shadow-2xl flex-shrink-0">
              <img src={architect.image} alt={architect.name} className="w-full h-full object-cover object-top" />
            </div>
            <div className="flex-1">
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-white">{architect.name}</h1>
              <p className="text-slate-400 mt-1">{architect.title} · {architect.firm}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1.5 text-slate-400"><MapPin size={13} />{architect.location}</span>
                <span className="flex items-center gap-1.5 text-amber-400"><Star size={13} className="fill-amber-400" />{architect.rating} ({architect.reviews} reviews)</span>
                <span className="text-slate-400">{architect.experience} years experience</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {architect.specialties.map(s => (
                  <span key={s} className="px-3 py-1 text-xs rounded-full bg-sky-400/10 border border-sky-400/20 text-sky-300">{s}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <a href={`mailto:${architect.email}`}
                className="px-5 py-3 bg-sky-400 hover:bg-sky-300 text-[#0F172A] font-semibold text-sm rounded-2xl transition-all flex items-center gap-2">
                <Mail size={15} /> Contact
              </a>
              <button onClick={() => showToast("Profile shared!", "success")}
                className="p-3 border border-white/12 text-slate-400 hover:text-white rounded-2xl transition-all hover:bg-white/5">
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: "Projects", value: architect.projects },
              { label: "Reviews", value: architect.reviews },
              { label: "Years Active", value: architect.experience },
            ].map(({ label, value }) => (
              <div key={label} className="p-5 rounded-2xl bg-[#1E293B] border border-white/8 text-center">
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white mb-1">{value}</div>
                <div className="text-slate-500 text-xs">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2">
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white mb-4">About</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{architect.bio}</p>

              {/* Awards */}
              <h3 className="text-white font-semibold mb-4">Awards & Recognition</h3>
              <div className="space-y-3 mb-8">
                {architect.awards.map((award, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-[#1E293B]/60 border border-white/6">
                    <div className="w-8 h-8 bg-amber-400/15 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award size={14} className="text-amber-400" />
                    </div>
                    <span className="text-slate-300 text-sm">{award}</span>
                  </div>
                ))}
              </div>

              {/* Portfolio */}
              <h3 className="text-white font-semibold mb-4">Portfolio</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {portfolio.map(d => <DesignCard key={d.id} design={d} />)}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="p-6 rounded-2xl bg-[#1E293B] border border-white/8">
                <h3 className="text-white font-semibold mb-5">Contact</h3>
                <div className="space-y-4">
                  <a href={`tel:${architect.phone}`} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm">
                    <div className="w-9 h-9 bg-sky-400/10 rounded-xl flex items-center justify-center"><Phone size={14} className="text-sky-400" /></div>
                    {architect.phone}
                  </a>
                  <a href={`mailto:${architect.email}`} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm">
                    <div className="w-9 h-9 bg-sky-400/10 rounded-xl flex items-center justify-center"><Mail size={14} className="text-sky-400" /></div>
                    {architect.email}
                  </a>
                  <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm">
                    <div className="w-9 h-9 bg-sky-400/10 rounded-xl flex items-center justify-center"><Globe size={14} className="text-sky-400" /></div>
                    {architect.website}
                  </a>
                  <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm">
                    <div className="w-9 h-9 bg-pink-500/10 rounded-xl flex items-center justify-center"><Instagram size={14} className="text-pink-400" /></div>
                    {architect.instagram}
                  </a>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-sky-400/8 border border-sky-400/20">
                <p className="text-slate-400 text-xs mb-1">Starting From</p>
                <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-sky-400 mb-4">{architect.startingBudget}</p>
                <a href={`mailto:${architect.email}`}
                  className="w-full block py-3 bg-sky-400 hover:bg-sky-300 text-[#0F172A] font-semibold text-sm rounded-xl transition-all text-center">
                  Request a Consultation
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// AI RECOMMENDATIONS PAGE
// ─────────────────────────────────────────────

function AIPage() {
  const { navigate } = useApp();
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm ArchVision AI. Describe your dream home — style, budget, location, bedrooms — and I'll find your perfect match.", results: null as any }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scroll = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(scroll, [messages, loading]);

  const handleSend = useCallback(async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: t, results: null }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));

    // Smart-ish matching based on keywords
    const lowerT = t.toLowerCase();
    let results = DESIGNS;
    if (lowerT.includes("minimalist")) results = DESIGNS.filter(d => d.style === "Minimalist");
    else if (lowerT.includes("biophilic") || lowerT.includes("green") || lowerT.includes("nature")) results = DESIGNS.filter(d => d.style === "Biophilic");
    else if (lowerT.includes("industrial") || lowerT.includes("loft")) results = DESIGNS.filter(d => d.style === "Industrial");
    else if (lowerT.includes("contemporary") || lowerT.includes("modern")) results = DESIGNS.filter(d => d.style === "Contemporary");
    else if (lowerT.includes("goa") || lowerT.includes("coastal")) results = DESIGNS.filter(d => d.location.toLowerCase().includes("goa"));
    else if (lowerT.includes("mumbai")) results = DESIGNS.filter(d => d.location.toLowerCase().includes("mumbai"));
    else if (lowerT.includes("bangalore") || lowerT.includes("bengaluru")) results = DESIGNS.filter(d => d.location.toLowerCase().includes("bangalore"));

    if (results.length === 0) results = DESIGNS.slice(0, 3);
    results = results.slice(0, 3);

    setMessages(prev => [...prev, {
      role: "ai",
      text: `Based on your requirements, here are my top ${results.length} recommendation${results.length !== 1 ? "s" : ""}:`,
      results,
    }]);
    setLoading(false);
  }, [loading]);

  return (
    <PageWrap>
      <div className="pt-16 min-h-screen flex flex-col max-w-4xl mx-auto px-4 pb-6">
        {/* Header */}
        <div className="py-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-sky-400/20 to-violet-500/20 border border-sky-400/30 rounded-2xl flex items-center justify-center">
            <Bot size={24} className="text-sky-400" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-white mb-2">AI Design Matcher</h1>
          <p className="text-slate-500">Describe your dream home in plain English</p>
        </div>

        {/* Chat */}
        <div className="flex-1 space-y-5 overflow-y-auto pb-4">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%]", msg.role === "user" ? "" : "w-full")}>
                {msg.role === "ai" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-sky-400/15 border border-sky-400/30 rounded-xl flex items-center justify-center">
                      <Bot size={13} className="text-sky-400" />
                    </div>
                    <span className="text-sky-400 text-xs font-medium">ArchVision AI</span>
                  </div>
                )}
                <div className={cn("px-5 py-3.5 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-sky-400 text-[#0F172A] font-medium rounded-br-sm"
                    : "bg-[#1E293B] border border-white/8 text-slate-300 rounded-bl-sm")}>
                  {msg.text}
                </div>
                {msg.results && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {msg.results.map((d: any) => <DesignCard key={d.id} design={d} />)}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex items-center gap-2 px-5 py-3.5 bg-[#1E293B] border border-white/8 rounded-2xl rounded-bl-sm">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1, delay }}
                    className="w-2 h-2 bg-sky-400 rounded-full" />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div className="py-3">
          <p className="text-slate-600 text-xs mb-2">Try these:</p>
          <div className="flex flex-wrap gap-2">
            {AI_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => handleSend(p)}
                className="px-3 py-1.5 text-xs rounded-full border border-white/10 text-slate-400 hover:text-sky-400 hover:border-sky-400/40 transition-all">
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-3 pt-3 border-t border-white/8">
          <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#1E293B] border border-white/10 focus-within:border-sky-400/40 transition-colors">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend(input)}
              placeholder="I want a 3BHK minimalist villa under ₹70 lakh..."
              className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 outline-none" />
          </div>
          <button onClick={() => handleSend(input)} disabled={!input.trim() || loading}
            className="w-12 h-12 bg-sky-400 hover:bg-sky-300 disabled:opacity-40 text-[#0F172A] rounded-2xl flex items-center justify-center transition-all flex-shrink-0">
            <Send size={17} />
          </button>
        </div>
      </div>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// FAVORITES PAGE
// ─────────────────────────────────────────────

function FavoritesPage() {
  const { navigate, favorites, toggleFavorite, showToast } = useApp();
  const savedDesigns = DESIGNS.filter(d => favorites.includes(d.id));

  return (
    <PageWrap>
      <div className="pt-24 min-h-screen max-w-7xl mx-auto px-6 pb-16">
        <div className="mb-10">
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-white mb-2">Saved Designs</h1>
          <p className="text-slate-500">{savedDesigns.length} {savedDesigns.length === 1 ? "design" : "designs"} saved</p>
        </div>

        {savedDesigns.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-20 h-20 bg-[#1E293B] border border-white/8 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Heart size={32} className="text-slate-600" />
            </div>
            <h2 className="text-white text-xl font-semibold mb-3">No saved designs yet</h2>
            <p className="text-slate-500 mb-8">Browse designs and tap the heart icon to save your favourites.</p>
            <button onClick={() => navigate("explore")}
              className="px-8 py-3.5 bg-sky-400 hover:bg-sky-300 text-[#0F172A] font-semibold text-sm rounded-2xl transition-all">
              Explore Designs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedDesigns.map(d => (
              <motion.div key={d.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="relative">
                  <DesignCard design={d} />
                  <button
                    onClick={() => { toggleFavorite(d.id); showToast("Removed from saved", "info"); }}
                    className="absolute top-12 right-3 w-8 h-8 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center hover:bg-red-500/40 transition-all z-10">
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// COMPARE PAGE
// ─────────────────────────────────────────────

function ComparePage() {
  const { navigate } = useApp();
  const [archA, setArchA] = useState<number | "">("");
  const [archB, setArchB] = useState<number | "">("");

  const a = ARCHITECTS.find(arch => arch.id === Number(archA));
  const b = ARCHITECTS.find(arch => arch.id === Number(archB));

  const metrics = [
    { label: "Experience", aVal: a?.experience + " years", bVal: b?.experience + " years", aNum: a?.experience, bNum: b?.experience },
    { label: "Rating", aVal: a?.rating, bVal: b?.rating, aNum: a?.rating, bNum: b?.rating },
    { label: "Projects Completed", aVal: a?.projects, bVal: b?.projects, aNum: a?.projects, bNum: b?.projects },
    { label: "Client Reviews", aVal: a?.reviews, bVal: b?.reviews, aNum: a?.reviews, bNum: b?.reviews },
    { label: "Starting Budget", aVal: a?.startingBudget, bVal: b?.startingBudget, aNum: null, bNum: null },
    { label: "Location", aVal: a?.location, bVal: b?.location, aNum: null, bNum: null },
  ];

  return (
    <PageWrap>
      <div className="pt-24 min-h-screen max-w-6xl mx-auto px-6 pb-16">
        <div className="text-center mb-12">
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-white mb-3">Compare Architects</h1>
          <p className="text-slate-500">Select two architects to compare side by side</p>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {([["Architect A", archA, setArchA], ["Architect B", archB, setArchB]] as any[]).map(([label, val, setter]) => (
            <div key={label} className="p-6 rounded-2xl bg-[#1E293B] border border-white/8">
              <label className="text-slate-400 text-sm font-medium block mb-3">{label}</label>
              <select value={val} onChange={e => setter(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-sky-400/40 transition-colors">
                <option value="">Select an architect…</option>
                {ARCHITECTS.map(arch => (
                  <option key={arch.id} value={arch.id}>{arch.name} — {arch.firm}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {a && b ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Profile headers */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {[a, b].map(arch => (
                <div key={arch.id} className="p-6 rounded-2xl bg-[#1E293B] border border-white/8 text-center">
                  <img src={arch.image} alt={arch.name}
                    className="w-20 h-20 rounded-2xl object-cover object-top mx-auto mb-4 border-2 border-sky-400/30" />
                  <h3 className="text-white font-semibold mb-1">{arch.name}</h3>
                  <p className="text-slate-500 text-sm mb-3">{arch.firm}</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {arch.specialties.map(s => (
                      <span key={s} className="px-2 py-0.5 text-xs rounded-full bg-sky-400/10 border border-sky-400/20 text-sky-300">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Metrics */}
            <div className="rounded-2xl bg-[#1E293B] border border-white/8 overflow-hidden">
              {metrics.map((m, i) => (
                <div key={m.label} className={cn("grid grid-cols-3 gap-4 p-5", i > 0 && "border-t border-white/6")}>
                  <div className="text-center text-slate-200 text-sm font-medium">
                    {m.aNum !== null && m.bNum !== null && m.aNum > m.bNum ? (
                      <span className="text-sky-400 font-semibold">{m.aVal}</span>
                    ) : <span>{m.aVal}</span>}
                  </div>
                  <div className="text-center text-slate-500 text-xs font-medium uppercase tracking-wider flex items-center justify-center">
                    {m.label}
                  </div>
                  <div className="text-center text-slate-200 text-sm font-medium">
                    {m.aNum !== null && m.bNum !== null && m.bNum > m.aNum ? (
                      <span className="text-sky-400 font-semibold">{m.bVal}</span>
                    ) : <span>{m.bVal}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              {[a, b].map(arch => (
                <button key={arch.id} onClick={() => navigate("architect", arch.id)}
                  className="py-3.5 bg-sky-400 hover:bg-sky-300 text-[#0F172A] font-semibold text-sm rounded-2xl transition-all">
                  View {arch.name.split(" ")[0]}'s Profile
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-16 text-slate-600">
            <GitCompare size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">Select two architects above to begin comparing</p>
          </div>
        )}
      </div>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// ABOUT PAGE
// ─────────────────────────────────────────────

function AboutPage() {
  const { navigate } = useApp();
  const values = [
    { title: "Design-Led Discovery", desc: "We believe you should fall in love with a building before you meet its creator. Design leads; architects follow.", icon: Eye },
    { title: "Radical Transparency", desc: "Budgets, timelines, reviews — all real, all verified. No surprises, no commission-driven recommendations.", icon: Check },
    { title: "Architect Dignity", desc: "Our platform celebrates craft. Architects on ArchVision are presented as the artists they are, not as service listings.", icon: Award },
  ];

  return (
    <PageWrap>
      <div className="pt-16 min-h-screen">
        {/* Hero */}
        <div className="relative h-80 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=600&fit=crop&auto=format"
            alt="Architecture" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(15,23,42,0.5), rgba(15,23,42,1))" }} />
          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-4xl md:text-5xl font-bold text-white mb-4">
                Architecture Deserves<br />Better Discovery
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                We built ArchVision AI because finding your architect should feel as remarkable as the buildings they create.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-20">
          {/* Mission */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-sky-400 text-sm font-medium uppercase tracking-widest">Our Mission</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-white mt-3 mb-6 leading-tight">
                Connecting Vision to Craft,<br />One Project at a Time
              </h2>
              <p className="text-slate-400 leading-relaxed mb-5">
                ArchVision AI was founded by architects, clients, and technologists who were tired of the same frustrating experience: searching for architects by reputation rather than by resonance.
              </p>
              <p className="text-slate-400 leading-relaxed">
                We believe the built environment shapes how we live, work, and feel. Finding the right architect for a project shouldn't require industry connections or lucky referrals — it should start with a building that moves you.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="grid grid-cols-2 gap-4">
              {[
                { label: "Founded", value: "2022" },
                { label: "Team Size", value: "47" },
                { label: "Cities Active", value: "47" },
                { label: "Projects Completed", value: "3,200+" },
              ].map(({ label, value }) => (
                <div key={label} className="p-6 rounded-2xl bg-[#1E293B] border border-white/8">
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-sky-400 mb-2">{value}</div>
                  <div className="text-slate-500 text-sm">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-white">What We Stand For</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map(({ title, desc, icon: Icon }, i) => (
                <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-[#1E293B] border border-white/8">
                  <div className="w-12 h-12 bg-sky-400/10 border border-sky-400/20 rounded-2xl flex items-center justify-center mb-5">
                    <Icon size={20} className="text-sky-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-3">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div>
            <div className="text-center mb-12">
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-white">Meet the Team</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {ARCHITECTS.slice(0, 4).map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="text-center">
                  <img src={a.image} alt={a.name} className="w-20 h-20 rounded-2xl object-cover object-top mx-auto mb-3" />
                  <p className="text-white font-medium text-sm">{a.name}</p>
                  <p className="text-slate-500 text-xs">{a.title}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <button onClick={() => navigate("contact")}
              className="px-10 py-4 bg-sky-400 hover:bg-sky-300 text-[#0F172A] font-semibold rounded-2xl transition-all text-sm shadow-xl shadow-sky-400/25">
              Get in Touch
            </button>
          </div>
        </div>
      </div>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// CONTACT PAGE
// ─────────────────────────────────────────────

function ContactPage() {
  const { showToast } = useApp();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Message sent! We'll be in touch within 24 hours.", "success");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const info = [
    { icon: Mail, label: "Email", value: "primistry2004@gmail.com" },
    { icon: Phone, label: "Phone", value: "+91 87705 62234" },
    { icon: MapPin, label: "Office", value: "Bhilai, Chattisgarh, 490006" },
    { icon: Clock, label: "Hours", value: "Mon–Fri, 9am–7pm IST" },
  ];

  return (
    <PageWrap>
      <div className="pt-24 min-h-screen max-w-6xl mx-auto px-6 pb-16">
        <div className="text-center mb-14">
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-4xl font-bold text-white mb-3">Get in Touch</h1>
          <p className="text-slate-500 max-w-lg mx-auto">Whether you're a client, architect, or press — we'd love to hear from you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-[#1E293B] border border-white/8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-2">Your Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required placeholder="Rohan Malhotra"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 outline-none focus:border-sky-400/50 transition-colors" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-2">Email</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required type="email" placeholder="rohan@example.com"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 outline-none focus:border-sky-400/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-2">Subject</label>
                <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  required className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-sky-400/50 transition-colors">
                  <option value="">Select a topic…</option>
                  <option>I'm looking for an architect</option>
                  <option>I'm an architect and want to list</option>
                  <option>Press enquiry</option>
                  <option>Partnership opportunity</option>
                  <option>Technical support</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-2">Message</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  required rows={5} placeholder="Tell us how we can help..."
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 outline-none focus:border-sky-400/50 transition-colors resize-none" />
              </div>
              <button type="submit"
                className="w-full py-4 bg-sky-400 hover:bg-sky-300 text-[#0F172A] font-semibold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-400/20">
                <Send size={16} />
                Send Message
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-5">
            {info.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 p-5 rounded-2xl bg-[#1E293B] border border-white/8">
                <div className="w-10 h-10 bg-sky-400/10 border border-sky-400/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={16} className="text-sky-400" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium mb-1">{label}</p>
                  <p className="text-white text-sm">{value}</p>
                </div>
              </div>
            ))}

            <div className="p-5 rounded-2xl bg-sky-400/8 border border-sky-400/20">
              <h3 className="text-white font-semibold mb-2">Are you an architect?</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Join 340+ architects on ArchVision AI and connect with clients who are already inspired by your style of work.
              </p>
              <button className="px-5 py-2.5 bg-sky-400 hover:bg-sky-300 text-[#0F172A] text-sm font-semibold rounded-xl transition-all">
                Apply to List Your Practice
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              {[
                { Icon: Twitter, href: "#", label: "Twitter" },
                { Icon: Instagram, href: "https://www.instagram.com/_brain._.less_/?hl=en", label: "Instagram" },
                { Icon: Linkedin, href: "https://www.linkedin.com/in/priyanshu-ranjan-mistry-9983842a1/", label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 text-slate-400 hover:text-white hover:border-white/25 rounded-xl text-sm transition-all">
                  <Icon size={15} />
                  <span className="hidden sm:block">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrap>
  );
}

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedDesignId, setSelectedDesignId] = useState<number | null>(null);
  const [selectedArchitectId, setSelectedArchitectId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [toast, setToast] = useState<{ msg: string; type?: string } | null>(null);

  const navigate = useCallback((page: string, id?: number | null) => {
    setCurrentPage(page);
    if (page === "design" && id) setSelectedDesignId(id);
    if (page === "architect" && id) setSelectedArchitectId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }, []);

  const showToast = useCallback((msg: string, type = "success") => {
    setToast({ msg, type });
  }, []);

  const ctx = { currentPage, navigate, favorites, toggleFavorite, toast, setToast, showToast };

  return (
    <AppCtx.Provider value={ctx}>
      <div className="min-h-screen bg-background text-foreground"
        style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
        <Navbar currentPage={currentPage} />

        <AnimatePresence mode="wait">
          {currentPage === "home" && <Landing key="home" />}
          {currentPage === "explore" && <Explore key="explore" />}
          {currentPage === "design" && <DesignDetails key={`design-${selectedDesignId}`} designId={selectedDesignId} />}
          {currentPage === "architect" && <ArchitectProfile key={`arch-${selectedArchitectId}`} architectId={selectedArchitectId} />}
          {currentPage === "ai" && <AIPage key="ai" />}
          {currentPage === "favorites" && <FavoritesPage key="favorites" />}
          {currentPage === "compare" && <ComparePage key="compare" />}
          {currentPage === "about" && <AboutPage key="about" />}
          {currentPage === "contact" && <ContactPage key="contact" />}
        </AnimatePresence>

        {!["ai"].includes(currentPage) && <Footer />}
        <FAB />
        <ToastNotification />
      </div>
    </AppCtx.Provider>
  );
}
