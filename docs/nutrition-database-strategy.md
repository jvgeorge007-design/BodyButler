# Custom Nutrition Database Strategy

## Overview
Building proprietary nutrition database to enable full AI insights while avoiding FatSecret compliance restrictions.

## Data Sources

### 1. Restaurant/Fast Food Chains
**Target**: Top 50 restaurant chains (80% coverage)
- McDonald's, Burger King, Taco Bell, Subway, etc.
- Source: Official nutrition PDFs/websites
- Data ownership: Public information, freely usable

### 2. Grocery Products
**Primary**: USDA FoodData Central
- 400,000+ foods with complete nutrition
- Free API, no restrictions
- Government data - public domain

**Secondary**: Barcode/Product APIs
- Open Food Facts (free, crowdsourced)
- Nutritionix (paid, comprehensive)
- UPC Database APIs

### 3. Generic Foods
**USDA Foundation Foods**
- Basic ingredients (chicken breast, broccoli, etc.)
- Standardized nutrition per 100g
- Base for recipe calculations

## Database Schema

```sql
-- Custom nutrition database
custom_foods:
- id, food_name, brand_name, category
- calories_per_100g, protein_per_100g, etc.
- data_source ('restaurant', 'usda', 'manual')
- verified (boolean for quality control)

-- Product matching
product_matches:
- receipt_text, matched_food_id
- confidence_score, manual_verified
- user_feedback (for improving matching)
```

## Implementation Timeline

### Phase 1 (Week 1-2): Restaurant Database
- Scrape/compile top 20 fast food chains
- 500+ menu items with complete nutrition
- OCR matching algorithms

### Phase 2 (Week 3-4): USDA Integration  
- Integrate FoodData Central API
- Map common grocery products
- Fuzzy matching for receipt parsing

### Phase 3 (Week 5-6): Quality & Matching
- User feedback system for corrections
- Machine learning for better OCR matching
- Confidence scoring for nutrition data

## Benefits
- Complete AI insights and analytics ✅
- No API compliance restrictions ✅
- Historical nutrition tracking ✅
- Custom health scoring ✅
- Unlimited data storage ✅

## Development Priority
1. Restaurant chains (immediate user value)
2. Common grocery items (broad coverage)
3. Specialty/organic products (completeness)