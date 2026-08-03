# Barnard Mohair – Media & Journal Page Setup Guide

## WordPress Setup Steps
1. **Create a new page**  
   - Go to Pages → Add New.  
   - Title it “Journal” (or “Media”).  
   - In the page attributes panel, set the template to **Elementor Full Width** (or your custom full-width template) so the content spans the screen without sidebar.

2. **Create your blog post categories**  
   - Navigate to Posts → Categories.  
   - Add the categories listed in the **Recommended Post Categories** section below.  
   - Each category will be used to tag articles and drive the filter pills.

3. **Design the Journal page with Elementor**  
   - Click Edit with Elementor.  
   - Add a **Posts widget** (Elementor Pro) or a third-party grid widget like **Essential Addons Post Grid** (free) or **The Post Grid**.
   - If using Elementor Pro’s Posts widget:  
     * Under **Query**, select Source: Posts, then set Categories to include all journal categories.  
     * Under **Filter Bar**, enable it and choose **Category**. This will automatically generate filter pills from your post categories.  
     * Style the filters to match your brand buttons.
   - If using Essential Addons Post Grid:  
     * Add the EA Post Grid widget, enable **Category Filter**, and set the filter position at the top.
   - **All posts** will show when no filter is active. Map each pill to a category slug.

4. **Filter pills mapping**  
   If you need static filter pills rather than automatic generation, create seven text buttons or divs with anchor links. Use a setup where clicking a pill appends a query parameter, e.g. `/journal/?category=sustainability`. Then use a dynamic posts widget (like JetEngine or a custom query) to filter posts accordingly. For simplicity, automatic category filtering via the widget is recommended.

5. **Publish the page**  
   - Set a clean permalink: `https://barnardmohair.com/journal/`.  
   - Add the page to your main navigation (e.g. as “Journal” or “Our Stories”).

## Recommended Post Categories
Create these six categories under Posts → Categories.

| Category Name       | Slug               | Description |
|---------------------|--------------------|-------------|
| Sustainability      | sustainability     | Articles about ethical sourcing, mohair and the environment |
| Care Guides         | care-guides        | How to wash, store and maintain mohair pieces |
| Behind the Scenes   | behind-the-scenes  | A look at the workshop, women artisans and Alicedale life |
| Style & Wear        | style-wear         | Outfit inspiration, layering tips, mohair styling |
| Farm Stories        | farm-stories       | Angora goat tales, Eastern Cape farming heritage |
| News                | news               | Product launches, market events, brand updates |

## Media Page Filter Pills
Use exactly these seven filter pill labels. The anchor attribute should equal the category slug (except “All”).

| Pill Label         | Href / Filter Value | Maps to Category Slug    |
|--------------------|---------------------|--------------------------|
| All                | all                 | (show all posts)         |
| Sustainability     | sustainability      | sustainability           |
| Care Guides        | care-guides         | care-guides              |
| Behind the Scenes  | behind-the-scenes   | behind-the-scenes        |
| Style & Wear       | style-wear          | style-wear               |
| Farm Stories       | farm-stories        | farm-stories             |
| News               | news                | news                     |

If your widget uses CSS classes for filtering, replace `href=` with the corresponding data filter attribute, but the slug principles stay the same.

## SEO Quick Wins (Phase 1 Actions)
1. Install and activate **Yoast SEO** (or Rank Math).
2. Set the site title and meta description in Yoast → Settings → General (Site representation). Use “Barnard Mohair | Handcrafted Mohair Blankets & Accessories” and a compelling description.
3. Submit your XML sitemap to **Google Search Console**. The sitemap URL is typically `https://barnardmohair.com/sitemap_index.xml`.
4. Verify ownership and add your sitemap in Google Search Console. Do the same with **Bing Webmaster Tools**.
5. Create a **Google Analytics 4** property and connect it to your site via a plugin like Site Kit by Google or directly in your theme.
6. Change the permalink structure to **Post name** (Settings → Permalinks → Post name). This ensures clean, readable URLs.
7. Optimise every existing page: update focus keyphrase in Yoast, write a custom meta title (≤60 characters) and meta description (≤155 characters).
8. Add **alt text** to all product and blog images that includes relevant natural keywords without keyword stuffing.
9. Create internal links from your journal articles to key product pages (blankets, scarves, jackets) and vice versa.
10. Install a lightweight **caching plugin** (e.g., WP Fastest Cache or W3 Total Cache) and test mobile responsiveness via Google’s Mobile-Friendly Test.

## Article Upload Checklist
For each new journal article, complete the following before publishing.

- [ ] **Title**: Clear, benefit-driven headline (H1 in the article). Keep it under 70 characters if possible.
- [ ] **Slug**: URL-friendly version of the title, all lowercase, words separated by hyphens (e.g. `/mohair-sourcing-eastern-cape`).
- [ ] **Category**: Assign the most relevant category from the six listed above.
- [ ] **Featured Image**: Upload a high-resolution image (min. 1200×800px). Add descriptive alt text.
- [ ] **Meta Title**: Yoast snippet preview title, ≤60 characters, includes primary keyword and brand if space allows.
- [ ] **Meta Description**: ≤155 characters, summarises the article, includes a soft call to action.
- [ ] **Internal Links**: Add 2–3 contextual links to other journal articles, product collections, or the ‘About Us’ page using the [LINK: page name] format while drafting.
- [ ] **Tags**: Optionally add 3–5 relevant tags (e.g. “mohair care”, “sustainability”, “Eastern Cape”) to support internal site search and related posts.
- [ ] **Publish & Verify**: After publishing, visit the live URL, test the filter pill on the Journal page, and confirm the post appears under the correct category.