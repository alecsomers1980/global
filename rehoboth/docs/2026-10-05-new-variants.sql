-- Rehoboth: new variants, photos and copy (2026-10-05). Safe to re-run.
-- Never overwrites prices/stock; keeps any photo or wording already set in the admin.
begin;

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'powder'::variant_format,'150 g',217,167,'6006010100017',1,'/products/powder-a3',null,null from products where slug='artemisia-annua-a3'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'capsules'::variant_format,'90',279,215,'6006010100024',2,'/products/capsules-a3',null,null from products where slug='artemisia-annua-a3'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'bulk'::variant_format,'1 kg',984,757,'6006010100031',3,null,null,null from products where slug='artemisia-annua-a3'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'ointment'::variant_format,'50 ml',260,200,'6006010100048',4,'/products/ointment-artemisia','Soothing handmade herbal ointment crafted from Artemisia, a plant with a long tradition of use in skin care. Gentle everyday care for the skin.','Artemisia is traditionally valued in topical herbal preparations.' from products where slug='artemisia-annua-a3'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'oil'::variant_format,'Oil',260,200,'6006010100055',5,null,null,null from products where slug='artemisia-annua-a3'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'powder'::variant_format,'150 g',177,136,'6006010200014',1,'/products/powder-afra',null,null from products where slug='artemisia-afra'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'capsules'::variant_format,'90',242,186,'6006010200021',2,'/products/capsules-afra',null,null from products where slug='artemisia-afra'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'bulk'::variant_format,'1 kg',902,694,'6006010200038',3,null,null,null from products where slug='artemisia-afra'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'powder'::variant_format,'150 g',136,105,'6006010300011',1,'/products/powder-moringa',null,null from products where slug='moringa-oleifera'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'capsules'::variant_format,'90',130,100,'6006010300028',2,'/products/capsules-moringa',null,null from products where slug='moringa-oleifera'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'bulk'::variant_format,'1 kg',615,473,'6006010300035',3,null,null,null from products where slug='moringa-oleifera'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'ointment'::variant_format,'50 ml',260,200,'6006010300042',4,'/products/ointment-moringa','Gentle handmade herbal ointment enriched with Moringa oleifera. Nourishes and softens dry skin, promoting smoothness and hydration.','Moringa is traditionally valued for its nourishing, moisturising character.' from products where slug='moringa-oleifera'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'oil'::variant_format,'Oil',260,200,'6006010300059',5,null,null,null from products where slug='moringa-oleifera'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'powder'::variant_format,'150 g',182,140,'6006010400018',1,'/products/powder-turmeric',null,null from products where slug='turmeric-with-pepper'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'capsules'::variant_format,'90',195,150,'6006010400025',2,'/products/capsules-turmeric',null,null from products where slug='turmeric-with-pepper'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'powder'::variant_format,'150 g',208,160,'6006010500015',1,'/products/powder-rosemary',null,null from products where slug='rosemary'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'capsules'::variant_format,'90',221,170,'6006010500022',2,'/products/capsules-rosemary',null,null from products where slug='rosemary'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'ointment'::variant_format,'50 g',260,200,'6006010700019',1,'/products/ointment-neem','Handmade herbal ointment made with Azadirachta indica (neem), a plant long valued in traditional topical care. Soothing everyday skin care.','Neem is traditionally valued in topical herbal preparations.' from products where slug='neem'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'balm'::variant_format,'Marula · 10 g',52,40,null,1,'/products/lip-balm-marula','Handmade lip balm infused with Amarula fruit, known for its rich natural oils. Moisturises and protects dry or chapped lips, with natural antioxidants and vitamins from the fruit, for softness, elasticity and long-lasting hydration.',null from products where slug='lip-balm'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'balm'::variant_format,'Spearmint · 10 g',52,40,null,2,'/products/lip-balm-spearmint','Handmade lip balm infused with cooling spearmint. Moisturises and protects dry or chapped lips, with a refreshing sensation from natural spearmint oil and long-lasting hydration for soft, smooth lips.',null from products where slug='lip-balm'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

update products set summary='Traditional South African farm soap, cut into 150–170 g bars — in twelve scents and blends.' where slug='boerseep';
insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'bar'::variant_format,'Artemisia · 150–170 g',60,46,null,1,'/products/boerseep-artemisia','Natural herbal soap made with Artemisia afra (African wormwood), with a fresh, earthy fragrance. Gentle enough for daily use on skin and hands.','Artemisia afra is a traditional African herb long valued for its soothing, aromatic character.' from products where slug='boerseep'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'bar'::variant_format,'Rosemary · 150–170 g',60,46,null,2,'/products/boerseep-rosemary','Natural herbal soap infused with Rosmarinus officinalis (rosemary): a crisp, refreshing aroma and a gentle cleanse.','Rosemary is traditionally appreciated for its clean, stimulating scent.' from products where slug='boerseep'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'bar'::variant_format,'Lavender · 150–170 g',60,46,null,3,'/products/boerseep-lavender','Handcrafted with Lavandula angustifolia (lavender): a soft floral fragrance and a gentle cleansing touch.','Lavender is traditionally valued for its calming scent and gentle character.' from products where slug='boerseep'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'bar'::variant_format,'Moringa · 150–170 g',60,46,null,4,'/products/boerseep-moringa','Made with Moringa oleifera for a gentle cleanse and a subtle, earthy fragrance. A daily companion that leaves skin feeling fresh and soft.','Moringa is traditionally treasured as a nutrient-dense plant.' from products where slug='boerseep'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'bar'::variant_format,'Moerkoffie · 150–170 g',60,46,null,5,'/products/boerseep-moerkoffie','Infused with the deep, comforting aroma of traditional South African moerkoffie. A warm, earthy bar with rustic charm.','Moerkoffie is traditionally appreciated for its energising aroma and gentle exfoliating texture.' from products where slug='boerseep'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'bar'::variant_format,'Charcoal · 150–170 g',60,46,null,6,'/products/boerseep-charcoal','Handmade with activated charcoal: a bold, earthy bar that cleanses gently and leaves skin feeling fresh and smooth.','Charcoal is traditionally valued for its absorbing, clarifying character.' from products where slug='boerseep'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'bar'::variant_format,'Turmeric · 150–170 g',60,46,null,7,'/products/boerseep-turmeric','Handmade with Curcuma longa (turmeric): a warm, earthy fragrance and a rich golden colour.','Turmeric is traditionally valued in herbal skin care for its golden colour and warmth.' from products where slug='boerseep'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'bar'::variant_format,'Cinnamon · 150–170 g',60,46,null,8,'/products/boerseep-cinnamon','Handmade with Cinnamomum verum (cinnamon): a sweet-spicy fragrance that uplifts the senses while cleansing gently.','Cinnamon is traditionally valued for its warming, invigorating aroma.' from products where slug='boerseep'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'bar'::variant_format,'Natural Plain · 150–170 g',60,46,null,9,'/products/boerseep-natural-plain','Made in the timeless tradition of boerseep: a plain, unscented bar with no added fragrance or herbs. Suited to all skin types, including sensitive skin.','Plain boerseep is traditionally valued for its mild, versatile cleansing and everyday household use.' from products where slug='boerseep'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'bar'::variant_format,'African Sunset · 150–170 g',60,46,null,10,'/products/boerseep-african-sunset','Handmade with turmeric and activated charcoal: two natural ingredients in one earthy, characterful bar.','Turmeric and charcoal are each traditionally valued in herbal soapmaking for their colour and clarifying character.' from products where slug='boerseep'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'bar'::variant_format,'Salty Rocks · 150–170 g',60,46,null,11,'/products/boerseep-salty-rocks','Activated charcoal and natural salt in one handcrafted bar: a bold, invigorating cleanse with a subtle freshness.','Charcoal and salt are traditionally valued for their clarifying, mineral character.' from products where slug='boerseep'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'bar'::variant_format,'Cedar Glow · 150–170 g',60,46,null,12,'/products/boerseep-cedar-glow','Handmade with rooibos (Aspalathus linearis) and the warm, woody fragrance of cedarwood: a distinctly South African bar.','Rooibos and cedarwood are traditionally valued for their comforting, grounding aroma.' from products where slug='boerseep'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

update products set summary='30 ml herbal tinctures — Artemisia or garlic.' where slug='tinctures';
insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'tincture'::variant_format,'Artemisia · 30 ml',150,135,null,1,'/products/tincture-artemisia','Natural tincture made from Artemisia annua anamed (A-3), known locally as wilde als, a traditional herb. A 30 ml bottle.','Artemisia annua is a long-used bitter aromatic herb.' from products where slug='tinctures'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

insert into product_variants (product_id,format,size_label,price_retail,price_trade,barcode,sort_order,image_url,summary,traditional_use)
select id,'tincture'::variant_format,'Garlic · 30 ml',150,135,null,2,'/products/tincture-garlic','Natural tincture made from Allium sativum (garlic), a time-honoured kitchen and herbal staple. A 30 ml bottle.','Garlic is traditionally valued as a household herbal remedy.' from products where slug='tinctures'
on conflict (product_id,format,size_label) do update set
  image_url=coalesce(product_variants.image_url,excluded.image_url),
  summary=coalesce(product_variants.summary,excluded.summary),
  traditional_use=coalesce(product_variants.traditional_use,excluded.traditional_use);

-- Retire the rows these replace.
update product_variants set active=false where size_label in ('30 ml','Cappuccino · 150–170 g') and product_id in (select id from products where slug in ('tinctures','boerseep'));

commit;
