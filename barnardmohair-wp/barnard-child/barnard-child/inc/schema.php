<?php
/**
 * Structured data (JSON-LD) for Barnard Mohair.
 *
 * @package BarnardMohair
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * LocalBusiness + ClothingStore + OnlineStore schema — emitted on every page.
 */
add_action( 'wp_head', 'barnard_emit_business_schema', 30 );
function barnard_emit_business_schema() {
    $site_url = trailingslashit( home_url() );

    $schema = array(
        '@context'   => 'https://schema.org',
        '@type'      => array( 'LocalBusiness', 'ClothingStore', 'OnlineStore' ),
        '@id'        => $site_url . '#business',
        'name'       => 'Barnard Mohair',
        'alternateName' => 'Barnard Mohair Eastern Cape',
        'url'        => $site_url,
        'logo'       => $site_url . 'wp-content/uploads/2024/08/Logo.png',
        'image'      => array(
            $site_url . 'wp-content/uploads/2024/08/5-1024x836.jpg',
            $site_url . 'wp-content/uploads/2024/08/1.jpg',
        ),
        'description' => 'Handcrafted mohair blankets, jackets and scarves from the Eastern Cape of South Africa. Family-made since 1967 using locally sourced Angora goat fibre and eco-sensitive production methods.',
        'telephone'  => '+27730392013',
        'email'      => 'info@barnardmohair.com',
        'priceRange' => 'R495–R3,300 ZAR',
        'address'    => array(
            '@type'           => 'PostalAddress',
            'addressLocality' => 'Alicedale',
            'addressRegion'   => 'Eastern Cape',
            'addressCountry'  => 'ZA',
        ),
        'geo' => array(
            '@type'     => 'GeoCoordinates',
            'latitude'  => -33.1833,
            'longitude' => 26.0833,
        ),
        'foundingDate' => '1967',
        'founder' => array(
            '@type' => 'Person',
            'name'  => 'Jan Paul Barnard',
        ),
        'areaServed' => array(
            array( '@type' => 'Country', 'name' => 'South Africa' ),
            array( '@type' => 'Country', 'name' => 'Global' ),
        ),
        'hasOfferCatalog' => array(
            '@type' => 'OfferCatalog',
            'name'  => 'Barnard Mohair Products',
            'itemListElement' => array(
                array(
                    '@type' => 'OfferCatalog',
                    'name'  => 'Mohair Blankets',
                    'url'   => $site_url . 'product-category/blankets-2/',
                ),
                array(
                    '@type' => 'OfferCatalog',
                    'name'  => 'Mohair Jackets',
                    'url'   => $site_url . 'product-category/jackets/',
                ),
                array(
                    '@type' => 'OfferCatalog',
                    'name'  => 'Kid Mohair Scarves',
                    'url'   => $site_url . 'product-category/kid-mohair-scarves/',
                ),
                array(
                    '@type' => 'OfferCatalog',
                    'name'  => 'Travel Blankets',
                    'url'   => $site_url . 'product-category/blankets-2/travel-blanket/',
                ),
            ),
        ),
        'sameAs' => array(
            'https://www.facebook.com/profile.php?id=100057658869744',
            'https://www.instagram.com/barnard_mohair',
        ),
    );

    $schema = apply_filters( 'barnard_business_schema', $schema );

    echo "\n<!-- Barnard Mohair Business Schema -->\n";
    echo '<script type="application/ld+json">' . wp_json_encode(
        $schema,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    ) . "</script>\n";
}

/**
 * FAQPage schema — emitted on home, about, and care-guide pages.
 */
add_action( 'wp_head', 'barnard_emit_faq_schema', 31 );
function barnard_emit_faq_schema() {
    if ( ! ( is_front_page() || is_page( 'about-us' ) || is_page( 'care-guide' ) ) ) {
        return;
    }
    $site_url = trailingslashit( home_url() );
    $faq = array(
        '@context'   => 'https://schema.org',
        '@type'      => 'FAQPage',
        '@id'        => $site_url . '#faq',
        'mainEntity' => array(
            barnard_faq(
                'How do I care for my Barnard Mohair blanket?',
                'Hand wash in lukewarm water using a mild wool detergent. Gently press out excess water — never wring. Lay flat to dry away from direct sunlight or heat. Do not tumble dry. Shake or lightly brush the pile when dry to restore its lustre.'
            ),
            barnard_faq(
                'Is mohair a sustainable fibre?',
                'Yes. Mohair is a natural, renewable fibre obtained by shearing Angora goats twice a year — no animals are harmed. It is biodegradable, long-lasting, and requires far less processing than synthetic alternatives. Barnard Mohair uses eco-sensitive production methods throughout.'
            ),
            barnard_faq(
                'Where does Barnard Mohair source its fibre?',
                'All our mohair is sourced locally from Angora goat farms in the Eastern Cape of South Africa — the world\'s finest mohair-producing region. The Karoo climate produces the longest, finest, most lustrous fibres available.'
            ),
            barnard_faq(
                'Do you ship internationally?',
                'Yes. We ship worldwide via Aramex. Duties and taxes are payable by the recipient on arrival. Delivery times and rates are calculated at checkout. Contact us for wholesale or bulk enquiries.'
            ),
            barnard_faq(
                'What is the difference between kid mohair and brushed mohair?',
                'Kid mohair is shorn from young Angora goats (first or second shearing) and is the finest, softest grade of mohair available. Brushed mohair has been mechanically brushed to raise the fibres into a fluffy, halo-like texture. Both are luxurious; kid mohair is lighter and finer, while brushed mohair is warmer and more voluminous.'
            ),
            barnard_faq(
                'Who makes Barnard Mohair products?',
                'Barnard Mohair is a second-generation family business founded in 1967 by Jan Paul Barnard in Alicedale, a small railway town in the Karoo. Today, the second generation continues the tradition. All products are crafted and finished by skilled women from the local community.'
            ),
            barnard_faq(
                'What types of products does Barnard Mohair offer?',
                'We make mohair travel blankets, bed blankets, tunic jackets, talisman jackets, and kid mohair scarves. All products are available on our online catalogue and can be ordered for local or international delivery.'
            ),
            barnard_faq(
                'Can I visit the factory?',
                'Yes — factory visits are available by appointment. Visit our Factory Visits page for more information or contact us via WhatsApp to arrange a visit to our Alicedale workshop.'
            ),
            barnard_faq(
                'Do you offer wholesale or trade pricing?',
                'Yes. We have a dedicated Wholesale and Trade programme for retailers and interior designers. Visit our Wholesale and Trade page or contact us directly for terms and a trade catalogue.'
            ),
        ),
    );
    $faq = apply_filters( 'barnard_faq_schema', $faq );
    echo "\n<!-- Barnard Mohair FAQ Schema -->\n";
    echo '<script type="application/ld+json">' . wp_json_encode(
        $faq,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    ) . "</script>\n";
}

function barnard_faq( $q, $a ) {
    return array(
        '@type'          => 'Question',
        'name'           => $q,
        'acceptedAnswer' => array(
            '@type' => 'Answer',
            'text'  => $a,
        ),
    );
}

/**
 * BreadcrumbList schema on non-home pages.
 */
add_action( 'wp_head', 'barnard_emit_breadcrumb_schema', 32 );
function barnard_emit_breadcrumb_schema() {
    if ( is_front_page() || ! ( is_page() || is_singular() ) ) {
        return;
    }
    $site_url = trailingslashit( home_url() );
    $page     = get_post();
    if ( ! $page ) {
        return;
    }
    $crumbs = array(
        '@context'        => 'https://schema.org',
        '@type'           => 'BreadcrumbList',
        'itemListElement' => array(
            array(
                '@type'    => 'ListItem',
                'position' => 1,
                'name'     => 'Home',
                'item'     => $site_url,
            ),
            array(
                '@type'    => 'ListItem',
                'position' => 2,
                'name'     => get_the_title( $page ),
                'item'     => get_permalink( $page ),
            ),
        ),
    );
    echo "\n<!-- Barnard Mohair Breadcrumb Schema -->\n";
    echo '<script type="application/ld+json">' . wp_json_encode(
        $crumbs,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    ) . "</script>\n";
}

/**
 * Article schema on single Journal posts.
 */
add_action( 'wp_head', 'barnard_emit_article_schema', 33 );
function barnard_emit_article_schema() {
    if ( ! is_single() ) {
        return;
    }
    $site_url = trailingslashit( home_url() );
    $article  = array(
        '@context'         => 'https://schema.org',
        '@type'            => 'Article',
        '@id'              => get_permalink() . '#article',
        'headline'         => get_the_title(),
        'description'      => get_the_excerpt(),
        'datePublished'    => get_the_date( 'c' ),
        'dateModified'     => get_the_modified_date( 'c' ),
        'inLanguage'       => 'en-ZA',
        'author'           => array(
            '@type' => 'Organization',
            'name'  => 'Barnard Mohair',
            '@id'   => $site_url . '#business',
        ),
        'publisher'        => array(
            '@type' => 'Organization',
            'name'  => 'Barnard Mohair',
            '@id'   => $site_url . '#business',
        ),
        'mainEntityOfPage' => array(
            '@type' => 'WebPage',
            '@id'   => get_permalink(),
        ),
    );
    if ( has_post_thumbnail() ) {
        $article['image'] = get_the_post_thumbnail_url( null, 'large' );
    }
    echo "\n<!-- Barnard Mohair Article Schema -->\n";
    echo '<script type="application/ld+json">' . wp_json_encode(
        $article,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    ) . "</script>\n";
}

/**
 * Speakable schema on the homepage.
 */
add_action( 'wp_head', 'barnard_emit_speakable_schema', 34 );
function barnard_emit_speakable_schema() {
    if ( ! is_front_page() ) {
        return;
    }
    $speakable = array(
        '@context'    => 'https://schema.org',
        '@type'       => 'WebPage',
        '@id'         => trailingslashit( home_url() ) . '#speakable',
        'name'        => 'Barnard Mohair — Handcrafted Mohair Blankets & Jackets, Eastern Cape',
        'description' => 'Barnard Mohair is a second-generation South African family business making premium mohair blankets, jackets and scarves from locally sourced Eastern Cape Angora goat fibre. Founded in Alicedale in 1967. Ships worldwide.',
        'speakable'   => array(
            '@type'       => 'SpeakableSpecification',
            'cssSelector' => array( '.barnard-seo-lede h1', '.barnard-seo-lede p' ),
        ),
        'inLanguage'  => 'en-ZA',
    );
    echo "\n<!-- Barnard Mohair Speakable Schema -->\n";
    echo '<script type="application/ld+json">' . wp_json_encode(
        $speakable,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    ) . "</script>\n";
}
