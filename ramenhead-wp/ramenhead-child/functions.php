<?php
/**
 * Ramenhead — Hello Elementor child theme.
 *
 * @package Ramenhead
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'RAMENHEAD_VERSION', '1.0.0' );
define( 'RAMENHEAD_DIR', trailingslashit( get_stylesheet_directory() ) );
define( 'RAMENHEAD_URL', trailingslashit( get_stylesheet_directory_uri() ) );

/**
 * Enqueue parent + child stylesheets.
 * Hello Elementor's main style handle is 'hello-elementor-theme-style'.
 */
add_action( 'wp_enqueue_scripts', 'ramenhead_enqueue_styles', 20 );
function ramenhead_enqueue_styles() {
    wp_enqueue_style(
        'ramenhead-child',
        RAMENHEAD_URL . 'style.css',
        array( 'hello-elementor-theme-style' ),
        RAMENHEAD_VERSION
    );
}

/**
 * Register the primary navigation location.
 * Hello Elementor already registers 'menu-1' but we add a friendlier label
 * so the imported "Primary Navigation" menu lands in the right slot.
 */
add_action( 'after_setup_theme', 'ramenhead_register_menus' );
function ramenhead_register_menus() {
    register_nav_menus(
        array(
            'primary' => __( 'Primary Navigation', 'ramenhead' ),
        )
    );
}

/**
 * Restaurant + LocalBusiness JSON-LD schema, emitted on every page.
 *
 * Lives in functions.php (not Elementor footer) so it survives template
 * deletions / theme builder edits. Priority 30 keeps it AFTER Yoast's
 * Organization graph at priority 10, avoiding @id collisions.
 */
require_once RAMENHEAD_DIR . 'inc/schema.php';

/**
 * Optional shortcodes for use inside Elementor HTML widgets or page content.
 *
 *   [ramenhead_book_now]   – the BOOK NOW button
 *   [ramenhead_hours]      – opening hours block
 *   [ramenhead_locations]  – both addresses
 */
require_once RAMENHEAD_DIR . 'inc/shortcodes.php';

/**
 * AI agent discovery — virtual robots.txt + /llms.txt endpoint.
 */
require_once RAMENHEAD_DIR . 'inc/ai-discovery.php';

/**
 * Tell Yoast SEO that the primary entity on this site is a Restaurant
 * (not the default WebPage). This makes Yoast's own graph chain into
 * our Restaurant @id rather than emit a competing Organization.
 */
add_filter( 'wpseo_schema_graph_pieces', 'ramenhead_filter_yoast_schema', 11, 2 );
function ramenhead_filter_yoast_schema( $pieces, $context ) {
    // Drop Yoast's Organization piece — our Restaurant schema covers it.
    foreach ( $pieces as $key => $piece ) {
        if ( is_object( $piece ) && false !== strpos( get_class( $piece ), 'Organization' ) ) {
            unset( $pieces[ $key ] );
        }
    }
    return array_values( $pieces );
}

/**
 * Add hreflang + locale hints for GEO targeting (en-ZA).
 */
add_filter( 'language_attributes', 'ramenhead_language_attributes' );
function ramenhead_language_attributes( $output ) {
    if ( false === strpos( $output, 'lang=' ) ) {
        return $output;
    }
    return preg_replace( '/lang="[^"]*"/', 'lang="en-ZA"', $output );
}

/**
 * Inject GEO meta tags in <head> for legacy GEO crawlers
 * (still respected by some local-search aggregators).
 */
add_action( 'wp_head', 'ramenhead_geo_meta', 2 );
function ramenhead_geo_meta() {
    ?>
    <meta name="geo.region" content="ZA-WC" />
    <meta name="geo.placename" content="Cape Town" />
    <meta name="geo.position" content="-33.9249;18.4192" />
    <meta name="ICBM" content="-33.9249, 18.4192" />
    <?php
}

/**
 * Default OG locale for South Africa.
 */
add_filter( 'wpseo_locale', function () {
    return 'en_ZA';
} );

/**
 * Obfuscate plain-text email addresses in rendered content so they're
 * not trivially harvested by scrapers. Uses WordPress's built-in
 * antispambot() to encode the email as HTML entities — browsers and
 * mail clients still resolve it normally; basic scrapers usually don't.
 *
 * Runs on post content, widget output, and Elementor widget output
 * (so the footer Contact block and any text-editor widgets are covered).
 */
add_filter( 'the_content', 'ramenhead_obfuscate_emails' );
add_filter( 'widget_text', 'ramenhead_obfuscate_emails' );
add_filter( 'elementor/widget/render_content', 'ramenhead_obfuscate_emails', 20 );
function ramenhead_obfuscate_emails( $content ) {
    if ( ! is_string( $content ) || strpos( $content, '@' ) === false ) {
        return $content;
    }
    return preg_replace_callback(
        '/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/',
        function ( $m ) { return antispambot( $m[1] ); },
        $content
    );
}

/**
 * Google Analytics 4 — paste your Measurement ID below to enable.
 * Leave as the placeholder to keep GA4 disabled.
 *
 * Get the ID from: https://analytics.google.com → Admin → Data Streams →
 * select your stream → "Measurement ID" (looks like G-XXXXXXXXXX).
 */
define( 'RAMENHEAD_GA4_ID', 'G-XXXXXXXXXX' );

add_action( 'wp_head', 'ramenhead_ga4_snippet', 1 );
function ramenhead_ga4_snippet() {
    $id = RAMENHEAD_GA4_ID;
    if ( ! $id || $id === 'G-XXXXXXXXXX' ) {
        return; // not configured yet — silently skip
    }
    ?>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr( $id ); ?>"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '<?php echo esc_js( $id ); ?>', { 'anonymize_ip': true });
    </script>
    <?php
}

/**
 * Strip emoji & oEmbed scripts we don't need (perf + cleaner head).
 */
add_action( 'init', 'ramenhead_disable_emojis' );
function ramenhead_disable_emojis() {
    remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
    remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
    remove_action( 'wp_print_styles', 'print_emoji_styles' );
    remove_action( 'admin_print_styles', 'print_emoji_styles' );
    remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
    remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
    remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
}

/**
 * Preload the two most-used Poppins weights for fast LCP.
 * Fonts are self-hosted (see fonts/ + style.css) — no Google CDN round-trip.
 */
add_action( 'wp_head', 'ramenhead_preload_fonts', 1 );
function ramenhead_preload_fonts() {
    $base = RAMENHEAD_URL . 'fonts/';
    ?>
    <link rel="preload" href="<?php echo esc_url( $base . 'poppins-400.woff2' ); ?>" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="<?php echo esc_url( $base . 'poppins-600.woff2' ); ?>" as="font" type="font/woff2" crossorigin>
    <?php
}

/**
 * Tell Elementor to skip its own Google Fonts request for Poppins —
 * we ship the font ourselves. This is the biggest single LCP win on
 * a fresh Elementor install (saves ~150–250 ms of render-block).
 */
add_filter( 'elementor/frontend/print_google_fonts', 'ramenhead_skip_elementor_google_fonts' );
function ramenhead_skip_elementor_google_fonts( $print ) {
    return false;
}

/**
 * Media page — client-side category filtering for the Posts grid.
 *
 * The seven pills on the Media page use hrefs like #filter-reviews. This
 * inline script catches their clicks and shows/hides post cards in the
 * .rh-overlay-grid based on the WordPress category class on each post.
 * No page reload, no AJAX — fast and reliable.
 */
add_action( 'wp_footer', 'ramenhead_media_filter_script' );
function ramenhead_media_filter_script() {
    if ( ! is_page( 'media' ) ) {
        return;
    }
    ?>
    <script>
    (function(){
        function init(){
            var pills = document.querySelectorAll('a[href^="#filter-"]');
            var grid = document.querySelector('.rh-overlay-grid .elementor-posts-container');
            if (!pills.length || !grid) return;
            var posts = grid.querySelectorAll('.elementor-post');

            function apply(slug){
                posts.forEach(function(p){
                    if (slug === 'all' || p.classList.contains('category-' + slug)) {
                        p.removeAttribute('data-rh-hidden');
                    } else {
                        p.setAttribute('data-rh-hidden', '1');
                    }
                });
                pills.forEach(function(a){
                    var s = (a.getAttribute('href') || '').replace('#filter-', '');
                    var btn = a.closest('.elementor-button-wrapper') ? a : a;
                    if (s === slug) btn.classList.add('is-active');
                    else btn.classList.remove('is-active');
                });
                if (history.replaceState) history.replaceState(null, '', '#filter-' + slug);
            }

            pills.forEach(function(a){
                a.addEventListener('click', function(e){
                    e.preventDefault();
                    var slug = (a.getAttribute('href') || '').replace('#filter-', '');
                    apply(slug);
                });
            });

            // Honour deep links: /media/#filter-reviews
            var hash = (window.location.hash || '').replace('#filter-', '');
            apply(hash && document.querySelector('a[href="#filter-' + hash + '"]') ? hash : 'all');
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    })();
    </script>
    <?php
}
