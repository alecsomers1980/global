<?php
/**
 * Restaurant + LocalBusiness JSON-LD schema for Ramenhead.
 *
 * Emitted on every page via wp_head. All values are filterable so
 * the host site can tweak hours / GPS / pricing without forking.
 *
 * @package Ramenhead
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'wp_head', 'ramenhead_emit_restaurant_schema', 30 );
function ramenhead_emit_restaurant_schema() {
    $site_url = trailingslashit( home_url() );
    $upload   = $site_url . 'wp-content/uploads/ramenhead/';

    $schema = array(
        '@context'           => 'https://schema.org',
        '@type'              => 'Restaurant',
        '@id'                => $site_url . '#restaurant',
        'name'               => 'Ramenhead',
        'alternateName'      => 'Ramenhead Cape Town',
        'url'                => $site_url,
        'logo'               => $upload . 'logo.png',
        'image'              => array(
            $upload . 'RAMENHEAD-WS-PIC-02.jpg',
            $upload . 'RAMENHEAD-WS-PIC-04.jpg',
            $upload . 'RAMENHEAD-WS-PIC-07.jpg',
        ),
        'telephone'          => '+27673128061',
        'email'              => 'info@ramenhead.co.za',
        'priceRange'         => 'R150–R420',
        'servesCuisine'      => array( 'Japanese', 'Ramen', 'Asian' ),
        'acceptsReservations'=> 'True',
        'paymentAccepted'    => 'Credit Card, Debit Card, EFT (No Cash)',
        'hasMenu'            => $site_url . 'menu/',
        'address'            => array(
            '@type'           => 'PostalAddress',
            'streetAddress'   => "37 Parliament Street, Speaker's Corner",
            'addressLocality' => 'Cape Town',
            'addressRegion'   => 'Western Cape',
            'postalCode'      => '8001',
            'addressCountry'  => 'ZA',
        ),
        'geo'                => array(
            '@type'    => 'GeoCoordinates',
            'latitude' => -33.9249,
            'longitude'=> 18.4192,
        ),
        'openingHoursSpecification' => array(
            array(
                '@type'     => 'OpeningHoursSpecification',
                'dayOfWeek' => array( 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ),
                'opens'     => '17:00',
                'closes'    => '22:00',
            ),
        ),
        'sameAs' => array(
            'https://www.instagram.com/ramenhead.za/',
            'https://www.facebook.com/ramenhead.za',
        ),
    );

    /**
     * Filter the entire Restaurant schema before output.
     *
     * @param array $schema The schema array.
     */
    $schema = apply_filters( 'ramenhead_restaurant_schema', $schema );

    echo "\n<!-- Ramenhead Restaurant Schema -->\n";
    echo '<script type="application/ld+json">' . wp_json_encode(
        $schema,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    ) . "</script>\n";
}

/**
 * On the dedicated menu page emit an additional Menu schema entity
 * pointing at the dishes — improves rich-result eligibility.
 */
add_action( 'wp_head', 'ramenhead_emit_menu_schema', 31 );
function ramenhead_emit_menu_schema() {
    if ( ! is_page( 'menu' ) ) {
        return;
    }
    $site_url = trailingslashit( home_url() );
    $menu = array(
        '@context' => 'https://schema.org',
        '@type'    => 'Menu',
        '@id'      => $site_url . 'menu/#menu',
        'name'     => 'Ramenhead Menu',
        'inLanguage' => 'en-ZA',
        'hasMenuSection' => array(
            array(
                '@type' => 'MenuSection',
                'name'  => 'Ramen Bowls',
                'hasMenuItem' => array(
                    ramenhead_menu_item( 'Tonkotsu', 'Rich pork bone broth, Tokyo noodles, pork belly chashu, pickled ginger, ajitamago, mayu, rayu, kikurage', 150, 220 ),
                    ramenhead_menu_item( 'Tofu Sesame Abura Soba', 'Soupless. Sesame & mala spice, kitakata noodles, smoked tofu, shiitake, menma, rayu', 150, 225 ),
                    ramenhead_menu_item( 'Torched Cape Wagyu', 'Wagyu MS9+, Tokyo noodles, beef broth, shoyu tare, spring onions, truffled kikurage, shiitake, menma', 420 ),
                    ramenhead_menu_item( 'Tori Paitan', 'Rich and creamy chicken broth, Tokyo style noodles, shoyu tare, chicken wonton, chicken chashu, spring onion, chilli oil', 160, 230 ),
                    ramenhead_menu_item( 'Karoo Lamb Tantanmen', 'Spicy roast mince, Japanese curry broth, kitakata noodles, coriander, raita, roast tomato, garlic oil', 150, 225 ),
                ),
            ),
            array(
                '@type' => 'MenuSection',
                'name'  => 'Small Plates',
                'hasMenuItem' => array(
                    ramenhead_menu_item( 'Fresh Cabbage Salad', 'Ponzu, crispy onion, smoked chilli', 85 ),
                    ramenhead_menu_item( 'Okonomiyaki Fries', 'Spring onion, nori, katsuobushi', 75 ),
                    ramenhead_menu_item( 'Tuna Tartare', 'Spicy sour dressing, wasabi, fresh daikon', 125 ),
                    ramenhead_menu_item( 'Sake Steamed Mussels', 'Umami garlic butter, shiso', 125 ),
                    ramenhead_menu_item( 'Karaage', 'Tokyo fried chicken, tomato chutney, curry sauce', 130 ),
                ),
            ),
            array(
                '@type' => 'MenuSection',
                'name'  => 'Gyoza',
                'hasMenuItem' => array(
                    ramenhead_menu_item( 'Aubergine & Sweetcorn', 'Crispy chilli & garlic, fresh basil, spring onion', 115 ),
                    ramenhead_menu_item( 'Ostrich & Wagyu', 'Danja & apricot chutney, coriander dressing', 135 ),
                ),
            ),
        ),
    );
    $menu = apply_filters( 'ramenhead_menu_schema', $menu );
    echo "\n<!-- Ramenhead Menu Schema -->\n";
    echo '<script type="application/ld+json">' . wp_json_encode(
        $menu,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    ) . "</script>\n";
}

/**
 * FAQ schema — the highest-leverage win for AI search agents and Google's
 * "People also ask" panel. Answers map 1:1 to the most common queries
 * about Ramenhead. Emitted on the About page, the home page and the menu
 * page (where it has the most contextual relevance).
 */
add_action( 'wp_head', 'ramenhead_emit_faq_schema', 32 );
function ramenhead_emit_faq_schema() {
    if ( ! ( is_front_page() || is_page( 'about' ) || is_page( 'menu' ) ) ) {
        return;
    }
    $site_url = trailingslashit( home_url() );
    $faq = array(
        '@context'   => 'https://schema.org',
        '@type'      => 'FAQPage',
        '@id'        => $site_url . '#faq',
        'mainEntity' => array(
            ramenhead_faq( 'Where is Ramenhead located?', 'Ramenhead is located at Speaker\'s Corner, 37 Parliament Street, in the historic centre of Cape Town.' ),
            ramenhead_faq( 'What are Ramenhead\'s opening hours?', 'Ramenhead serves dinner Tuesday through Saturday from 5:00 PM to 10:00 PM. Happy hour runs weekdays from 5:00 PM to 7:00 PM with 50% off all small plates and selected cocktails. There is live music every Thursday.' ),
            ramenhead_faq( 'Do you take reservations?', 'Yes. Reservations can be made via Dineplan at https://www.dineplan.com/restaurants/ramenhead. Walk-ins are welcome, and outside seating is available for walk-ins (weather dependent). Seating is limited to two hours per table.' ),
            ramenhead_faq( 'Do you have vegan or vegetarian options?', 'Yes. Our Tofu Sesame Abura Soba is a soupless vegan ramen, and several small plates (edamame, ramen chip, fresh cabbage salad, okonomiyaki fries) and the aubergine & sweetcorn gyoza are vegetarian or vegan-friendly.' ),
            ramenhead_faq( 'Do you accept cash?', 'No. Ramenhead is a cashless venue. We accept all major credit cards, debit cards and EFT payments.' ),
            ramenhead_faq( 'What is the price range?', 'Ramen bowls range from R150 (medium) to R230 (large) for our signature broths, with the Torched Cape Wagyu MS9+ ramen at R420. Small plates start from R70 and gyoza from R115.' ),
            ramenhead_faq( 'What kind of ramen do you serve?', 'We serve five signature ramen bowls: Tonkotsu (48-hour pork bone broth), Tori Paitan (creamy chicken), Karoo Lamb Tantanmen, Tofu Sesame Abura Soba (soupless, vegan), and Torched Cape Wagyu MS9+. All noodles are made fresh in-house on the only Yamato noodle machine in Africa.' ),
            ramenhead_faq( 'Can you accommodate allergies?', 'We can accommodate most dietary needs with prior notice. However, we cannot accommodate severe, fatal or allium/garlic allergies because our broths and oils contain alliums throughout. Please contact reservations before booking if you have a serious allergy.' ),
            ramenhead_faq( 'Is there live music?', 'Yes, Ramenhead has live music every Thursday. The atmosphere is casual and edgy, and happy hour runs weekdays from 5:00 PM to 7:00 PM with 50% off all small plates and selected cocktails.' ),
            ramenhead_faq( 'Who runs the Ramenhead kitchen?', 'The kitchen is led by Executive Chef Julia du Toit, with guidance from FYN Group\'s Peter Tempelhoff and Ashley Moss. It takes its cue from the ramen shops of Japan, with authentic techniques and carefully-selected ingredients.' ),
        ),
    );
    $faq = apply_filters( 'ramenhead_faq_schema', $faq );
    echo "\n<!-- Ramenhead FAQ Schema -->\n";
    echo '<script type="application/ld+json">' . wp_json_encode(
        $faq,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    ) . "</script>\n";
}

function ramenhead_faq( $q, $a ) {
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
 * BreadcrumbList schema for non-home pages.
 */
add_action( 'wp_head', 'ramenhead_emit_breadcrumb_schema', 33 );
function ramenhead_emit_breadcrumb_schema() {
    if ( is_front_page() || ! is_page() ) {
        return;
    }
    $site_url = trailingslashit( home_url() );
    $page = get_post();
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
    echo "\n<!-- Ramenhead Breadcrumb Schema -->\n";
    echo '<script type="application/ld+json">' . wp_json_encode(
        $crumbs,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    ) . "</script>\n";
}

/**
 * Speakable schema — flags the key content for voice assistants
 * (Google Assistant, Siri, Alexa) so they read the right summary.
 */
add_action( 'wp_head', 'ramenhead_emit_speakable_schema', 34 );
function ramenhead_emit_speakable_schema() {
    if ( ! is_front_page() ) {
        return;
    }
    $speakable = array(
        '@context'      => 'https://schema.org',
        '@type'         => 'WebPage',
        '@id'           => trailingslashit( home_url() ) . '#speakable',
        'name'          => 'Ramenhead — Authentic Japanese Ramen in Cape Town',
        'description'   => 'Ramenhead is an authentic Japanese ramen restaurant at Speaker\'s Corner, 37 Parliament Street in Cape Town. We make every noodle in-house on the only Yamato noodle machine in Africa and serve 48-hour Tonkotsu broths Tuesday through Saturday from 5 PM.',
        'speakable'     => array(
            '@type'   => 'SpeakableSpecification',
            'cssSelector' => array( '.rh-hidden-seo h1', '.rh-hidden-seo p' ),
        ),
        'inLanguage'    => 'en-ZA',
    );
    echo "\n<!-- Ramenhead Speakable Schema -->\n";
    echo '<script type="application/ld+json">' . wp_json_encode(
        $speakable,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    ) . "</script>\n";
}

/**
 * Helper to build a MenuItem with either a single price or a med/large pair.
 */
function ramenhead_menu_item( $name, $description, $price, $large_price = null ) {
    $item = array(
        '@type'       => 'MenuItem',
        'name'        => $name,
        'description' => $description,
    );
    if ( null === $large_price ) {
        $item['offers'] = array(
            '@type'         => 'Offer',
            'price'         => (string) $price,
            'priceCurrency' => 'ZAR',
        );
    } else {
        $item['offers'] = array(
            array(
                '@type'         => 'Offer',
                'name'          => 'Medium',
                'price'         => (string) $price,
                'priceCurrency' => 'ZAR',
            ),
            array(
                '@type'         => 'Offer',
                'name'          => 'Large',
                'price'         => (string) $large_price,
                'priceCurrency' => 'ZAR',
            ),
        );
    }
    return $item;
}
