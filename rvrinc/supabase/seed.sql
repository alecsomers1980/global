-- Seed Practice Areas
insert into public.practice_areas (slug, title, description, icon, features)
values
  ('litigation', 'Civil Litigation', 'Expert representation in High Court and Magistrate''s Court disputes. We handle complex commercial litigation, contractual disputes, and delictual claims with precision and aggression when necessary.', 'Scale', ARRAY['High Court & Magistrate''s Court Litigation', 'Contractual Disputes', 'Debt Collection', 'Interdicts & Urgent Applications']),
  ('family', 'Family Law', 'Compassionate and discreet legal support for sensitive family matters. We prioritize the best interests of children and fair financial settlements in divorce proceedings.', 'Heart', ARRAY['Divorce Proceedings (Contested & Uncontested)', 'Child Custody & Maintenance', 'Antinuptial Contracts', 'Protection Orders']),
  ('commercial', 'Commercial Law', 'Strategic legal advice for South African businesses. From company registration to complex mergers and compliance, we ensure your business is legally sound.', 'Briefcase', ARRAY['Company Registration & Structuring', 'Shareholders Agreements', 'Commercial Contracts', 'Business Rescue & Insolvency']),
  ('property', 'Property Law', 'Comprehensive conveyancing and property law services. We assist with residential and commercial transfers, lease agreements, and eviction proceedings.', 'Home', ARRAY['Property Transfers (Conveyancing)', 'Lease Agreements', 'Eviction Orders (PIE Act)', 'Sectional Title Disputes']),
  ('personal-injury', 'Personal Injury', 'Dedicated support for victims of negligence. We fight for maximum compensation in Road Accident Fund (RAF) claims and medical malpractice cases.', 'AlertCircle', ARRAY['Road Accident Fund (RAF) Claims', 'Medical Negligence', 'Public Liability Claims', 'Dog Bite Claims']),
  ('criminal', 'Criminal Law', 'Defending your rights in criminal proceedings. Our experienced attorneys provide 24/7 bail support and expert trial defense.', 'Gavel', ARRAY['24/7 Bail Applications', 'Criminal Trials', 'Diversion Representations', 'Expungement of Criminal Records'])
on conflict (slug) do nothing;

-- Seed Attorneys
insert into public.attorneys (slug, name, role, bio, qualifications, specialties, image, email, is_partner)
values
  ('marius-roets', 'Marius Roets', 'Senior Partner', 'Marius Roets is a founding partner with over 30 years of experience in Civil Litigation and Commercial Law. Known for his strategic approach in the High Court, he has successfully represented high-profile corporate clients and individuals alike.', ARRAY['B.Proc (University of Pretoria)', 'Admitted Attorney of the High Court (1990)', 'Right of Appearance in High Court'], ARRAY['Civil Litigation', 'Commercial Law'], '/assets/team/marius-placeholder.jpg', 'marius@rvrinc.co.za', true),
  ('johan-van-rensburg', 'Johan van Rensburg', 'Partner', 'Johan specializes in Family Law and Property disputes. With a reputation for fair but firm negotiation, leads the firm''s Family Law department.', ARRAY['LLB (University of Stellenbosch)', 'Admitted Attorney & Conveyancer (1995)'], ARRAY['Family Law', 'Property Law'], '/assets/team/johan-placeholder.jpg', 'johan@rvrinc.co.za', true),
  ('sarah-nkosi', 'Sarah Nkosi', 'Associate', 'Sarah is a rising star in Personal Injury and Labour Law. Her dedication to client justice has resulted in numerous successful RAF settlements.', ARRAY['LLB (Wits University)', 'Admitted Attorney (2020)'], ARRAY['Personal Injury', 'Labour Law'], '/assets/team/sarah-placeholder.jpg', 'sarah@rvrinc.co.za', false)
on conflict (slug) do nothing;

-- Seed Blog Posts
insert into public.blog_posts (slug, title, excerpt, content, published_date, author, category, image)
values
  ('new-divorce-laws-south-africa', 'Understanding the New Divorce Laws in South Africa', 'Recent amendments to the Divorce Act have significant implications for asset division. Here is what you need to know.', '<p>The landscape of family law in South Africa is constantly evolving. The recent changes to the Divorce Act aim to provide more equitable outcomes for parties in diverse marital regimes.</p><h3>Key Changes</h3><p>One of the most significant shifts involves the redistribution of assets...</p>', '2026-10-12', 'Johan van Rensburg', 'Family Law', '/assets/blog/divorce-law.jpg'),
  ('raf-claims-pitfalls', 'Road Accident Fund Claims: Common Pitfalls to Avoid', 'Navigating a RAF claim can be complex. Learn about the most common mistakes that lead to claim rejection.', '...', '2026-09-28', 'Sarah Nkosi', 'Personal Injury', '/assets/blog/raf-claims.jpg'),
  ('commercial-lease-guide', 'Commercial Lease Agreements: A Landlord''s Guide', 'Protecting your property assets starts with a watertight lease agreement. We breakdown the essential clauses.', '...', '2026-09-15', 'Marius Roets', 'Commercial Law', '/assets/blog/commercial-lease.jpg')
on conflict (slug) do nothing;
