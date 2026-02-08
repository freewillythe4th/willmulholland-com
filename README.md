# WillMulholland.com - Personal Brand Website

**Purpose**: Personal brand hub for the Intelligent Growth podcast, newsletter, and free resources.

## 🎯 Website Overview

This is Will Mulholland's personal brand website built from the Intelligent Marketer template. It serves as:

- **Podcast hub** for Intelligent Growth episodes
- **Newsletter signup** for weekly AI workflow content
- **Free resource delivery** (lead magnets like Charlotte's guide)
- **Personal brand positioning** showing real AI workflows

## 📁 File Structure

```
willmulholland-com/
├── index.html                              # Main landing page
├── podcast-episode-charlotte-norman.html   # Episode 1 template
├── images/                                 # Image assets (to be added)
└── README.md                              # This file
```

## 🚀 What's Already Built

### Main Landing Page (index.html)
- ✅ Hero section with clear value proposition
- ✅ Featured episode showcase
- ✅ All episodes grid (ready for more episodes)
- ✅ Free resources section
- ✅ Newsletter signup with Beehiiv embed
- ✅ About Will section
- ✅ Full footer with social links
- ✅ Mobile responsive navigation
- ✅ PostHog analytics integration

### Episode Page Template (podcast-episode-charlotte-norman.html)
- ✅ Episode header with metadata
- ✅ Video player section (ready for YouTube embed)
- ✅ "What You'll Learn" section
- ✅ Timestamps section (ready for final timestamps)
- ✅ Tools & resources mentioned
- ✅ About guest section
- ✅ Lead magnet CTA with Beehiiv embed
- ✅ Newsletter signup
- ✅ Related episodes section

## ⚠️ What Needs to be Updated

### 1. Beehiiv Embed IDs (CRITICAL)

**Update these placeholder IDs with real Beehiiv embed codes:**

**In index.html:**
- Line ~390: Newsletter embed
  ```html
  <iframe src="https://embeds.beehiiv.com/YOUR_BEEHIIV_EMBED_ID"
  ```

**In podcast-episode-charlotte-norman.html:**
- Line ~280: Lead magnet embed for Charlotte's guide
  ```html
  <iframe src="https://embeds.beehiiv.com/YOUR_BEEHIIV_LEAD_MAGNET_EMBED_ID"
  ```
- Line ~300: Newsletter embed
  ```html
  <iframe src="https://embeds.beehiiv.com/YOUR_BEEHIIV_NEWSLETTER_EMBED_ID"
  ```

**How to get Beehiiv embed codes:**
1. Go to Beehiiv dashboard
2. Create separate forms for:
   - Main newsletter signup (for index.html)
   - Charlotte's guide lead magnet (for episode page)
   - Newsletter signup on episode pages
3. Copy embed code for each
4. Replace placeholder URLs with actual Beehiiv embed URLs

### 2. YouTube Video Embeds

**Wait for Meta to provide:**
- Episode 1 final YouTube video URL
- Episode thumbnail image

**Then update in podcast-episode-charlotte-norman.html:**
- Line ~90: Replace placeholder with YouTube iframe
  ```html
  <iframe width="100%" height="100%"
          src="https://www.youtube.com/embed/VIDEO_ID"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
  </iframe>
  ```

**Also update in index.html:**
- Line ~145: Featured episode video embed
- Line ~230: Episode card thumbnail

### 3. Final Timestamps

**After Meta finishes editing, update:**
- podcast-episode-charlotte-norman.html lines ~150-180
- Replace placeholder timestamps with actual chapter markers
- Make timestamp links clickable with YouTube time codes

### 4. Images to Add

**Create/add these images to `/images/` folder:**
- `will-headshot.jpg` - Professional headshot for About section
- `charlotte-headshot.jpg` - Charlotte's photo for guest bio
- `podcast-cover-art.jpg` - Show artwork for social sharing
- `episode-1-thumbnail.jpg` - Episode 1 thumbnail (Meta will provide)

**Update image paths in HTML:**
- index.html line ~450: Will's headshot
- podcast-episode-charlotte-norman.html line ~195: Charlotte's headshot

### 5. Social Media Links

**Verify/update these URLs:**
- YouTube: `https://youtube.com/@willmulholland`
- LinkedIn: `https://linkedin.com/in/willcmulholland`
- Charlotte's LinkedIn: (get actual URL)
- Adora website: `https://adora.com`

## 📝 Next Steps for Will

### Immediate Actions:
1. ✅ **Set up Beehiiv account** and create 3 forms:
   - Main newsletter subscription
   - Charlotte's guide lead magnet
   - Episode page newsletter signup

2. ✅ **Get Beehiiv embed codes** and replace placeholders in HTML

3. ✅ **Get images**:
   - Professional headshot
   - Charlotte's headshot (ask her)
   - Podcast cover art

4. ⏳ **Wait for Meta** to provide:
   - Final edited video with YouTube URL
   - Episode thumbnail image
   - Confirmed timestamps

5. ✅ **Update YouTube channel description** (copy ready in separate doc)

6. ✅ **Set up hosting**:
   - GitHub Pages (free, easy)
   - Vercel (free, recommended)
   - Netlify (free alternative)
   - Custom domain: willmulholland.com

### After Meta Delivers Video:
1. Upload to YouTube with correct title/description
2. Get YouTube video ID from URL
3. Update both HTML files with YouTube embed codes
4. Update timestamps with clickable YouTube time codes
5. Test all Beehiiv form submissions
6. Deploy to production

## 🚢 Deployment Options

### Option 1: GitHub Pages (Simplest)
```bash
1. Create new repo: willmulholland-com
2. Push these files to repo
3. Go to Settings > Pages
4. Select main branch as source
5. Custom domain: willmulholland.com
```

### Option 2: Vercel (Recommended)
```bash
1. Sign up at vercel.com
2. Import GitHub repo
3. Deploy with one click
4. Add custom domain: willmulholland.com
```

### Option 3: Netlify
```bash
1. Sign up at netlify.com
2. Drag and drop folder
3. Add custom domain
```

## 🔗 Domain Setup

**Point willmulholland.com DNS to hosting:**

**For Vercel:**
- A record: `76.76.21.21`
- CNAME: `cname.vercel-dns.com`

**For GitHub Pages:**
- A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- CNAME: `willmulholland.github.io`

**For Netlify:**
- Follow Netlify's DNS instructions in dashboard

## 📊 Analytics Setup

PostHog is already integrated with ID: `phc_fZABguR4kZOTcKxWAGlqTCRiVb4tCOKaVDIZa1TJTiP`

**Verify it's working:**
1. Deploy site
2. Visit in browser
3. Check PostHog dashboard for pageviews
4. Set up conversion goals for newsletter signups

## 📧 Lead Magnet Flow

**Charlotte's Guide Delivery:**
1. User enters email in Beehiiv form on episode page
2. Beehiiv sends automated email with guide link
3. Guide hosted at: `/resources/charlotte-claude-guide.pdf` (create this)
4. Or link to Google Drive/Dropbox if easier

**Set up in Beehiiv:**
- Create lead magnet form
- Set up automated welcome email
- Include download link in email
- Tag subscribers as "Charlotte's Guide" for segmentation

## ✅ Pre-Launch Checklist

**Before going live:**
- [ ] All Beehiiv embeds working and tested
- [ ] YouTube video embedded and playing
- [ ] All images uploaded and displaying
- [ ] Charlotte's guide PDF uploaded and accessible
- [ ] Social media links verified
- [ ] Mobile responsive layout tested
- [ ] Newsletter signup tested (receive email confirmation)
- [ ] Lead magnet delivery tested (receive guide)
- [ ] PostHog tracking verified
- [ ] Domain DNS configured correctly
- [ ] SSL certificate active (HTTPS)
- [ ] All links tested (no 404s)

## 🎨 Design Notes

**Brand Colors:**
- Primary Purple: `#667eea`
- Secondary Purple: `#764ba2`
- Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

**Typography:**
- Font: Inter (Google Fonts)
- Headings: Bold 700-800
- Body: Regular 400-500

**Key Principles:**
- Clean, minimal design
- Focus on content and readability
- Strong CTAs for newsletter/resources
- Mobile-first responsive
- Fast loading (no heavy images)

## 📱 Future Episodes

**To add new episodes:**
1. Duplicate `podcast-episode-charlotte-norman.html`
2. Rename to `podcast-episode-[guest-name].html`
3. Update episode number, title, guest info
4. Add new YouTube embed and timestamps
5. Create new lead magnet form in Beehiiv (if applicable)
6. Update index.html episodes grid with new card

**Episode card template for index.html:**
```html
<div class="episode-card bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="h-48 bg-gray-200 relative">
        <img src="images/episode-X-thumb.jpg" alt="Episode X" class="w-full h-full object-cover">
        <div class="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            EP X
        </div>
    </div>
    <div class="p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-2">
            Episode Title
        </h3>
        <p class="text-gray-600 mb-4">
            Brief description of what guest shows.
        </p>
        <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">XX minutes</span>
            <a href="/podcast/episode-slug" class="text-purple-600 hover:text-purple-700 font-semibold">
                Watch →
            </a>
        </div>
    </div>
</div>
```

## 🤝 Content Collaboration with Meta

**Meta's Deliverables:**
- Final edited video file
- YouTube upload with correct title/description
- Episode thumbnail (16:9 ratio, 1280x720px)
- Confirmed timestamps with chapter markers
- Any additional show notes or links

**Will's Deliverables:**
- Website hosting and deployment
- Beehiiv newsletter setup
- Charlotte's guide PDF creation
- Social media promotion
- Domain and analytics setup

## 📞 Contact & Questions

**For questions about:**
- **Website functionality**: Contact Will
- **Video/YouTube**: Contact Meta
- **Newsletter setup**: Will + Beehiiv support
- **Domain/hosting**: Will + hosting provider support

---

**Built**: October 2025
**Template Source**: Intelligent Marketer landing page
**Tech Stack**: HTML, Tailwind CSS, PostHog, Beehiiv
**Status**: Ready for content updates and deployment
