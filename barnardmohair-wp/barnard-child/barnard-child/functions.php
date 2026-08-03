<?php
/**
 * Barnard Mohair — The7 (dt-the7) child theme.
 *
 * @package BarnardMohair
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'BARNARD_VERSION', '1.0.0' );
define( 'BARNARD_DIR', trailingslashit( get_stylesheet_directory() ) );
define( 'BARNARD_URL', trailingslashit( get_stylesheet_directory_uri() ) );

/**
 * Google Analytics 4 Measurement ID.
 * Replace G-XXXXXXXXXX with the real ID from Analytics → Admin → Data Streams.
 */
define( 'BARNARD_GA4_ID', 'G-ZBHM32DK0B' );

/**
 * Enqueue child stylesheet.
 *
 * The7 compiles and serves its own CSS through its asset pipeline — we do NOT
 * need to enqueue the parent style.css (it is a theme-identification file only,
 * not the actual styles). Our child CSS loads after The7's compiled output.
 */
add_action( 'wp_enqueue_scripts', 'barnard_enqueue_styles', 20 );
function barnard_enqueue_styles() {
    wp_enqueue_style(
        'barnard-child',
        BARNARD_URL . 'style.css',
        array(),
        BARNARD_VERSION
    );
}

/**
 * Register the primary navigation menu.
 */
add_action( 'after_setup_theme', 'barnard_register_menus' );
function barnard_register_menus() {
    register_nav_menus(
        array(
            'primary' => __( 'Primary Navigation', 'barnardmohair' ),
        )
    );
}

/**
 * Structured data (LocalBusiness, FAQ, Breadcrumb, Article, Speakable).
 */
require_once BARNARD_DIR . 'inc/schema.php';

/**
 * Shortcodes for Elementor HTML widgets.
 */
require_once BARNARD_DIR . 'inc/shortcodes.php';

/**
 * AI agent discovery — robots.txt + /llms.txt endpoint.
 */
require_once BARNARD_DIR . 'inc/ai-discovery.php';

/**
 * Tell Yoast the primary entity is our OnlineStore, not the default Organization.
 */
add_filter( 'wpseo_schema_graph_pieces', 'barnard_filter_yoast_schema', 11, 2 );
function barnard_filter_yoast_schema( $pieces, $context ) {
    foreach ( $pieces as $key => $piece ) {
        if ( is_object( $piece ) && false !== strpos( get_class( $piece ), 'Organization' ) ) {
            unset( $pieces[ $key ] );
        }
    }
    return array_values( $pieces );
}

/**
 * Force Yoast locale to en_ZA.
 */
add_filter( 'wpseo_locale', function () {
    return 'en_ZA';
} );

/**
 * Set the HTML lang attribute to en-ZA.
 */
add_filter( 'language_attributes', 'barnard_language_attributes' );
function barnard_language_attributes( $output ) {
    if ( false === strpos( $output, 'lang=' ) ) {
        return $output;
    }
    return preg_replace( '/lang="[^"]*"/', 'lang="en-ZA"', $output );
}

/**
 * GEO meta tags for Eastern Cape / Alicedale.
 */
add_action( 'wp_head', 'barnard_geo_meta', 2 );
function barnard_geo_meta() {
    ?>
    <meta name="geo.region" content="ZA-EC" />
    <meta name="geo.placename" content="Alicedale" />
    <meta name="geo.position" content="-33.1833;26.0833" />
    <meta name="ICBM" content="-33.1833, 26.0833" />
    <?php
}

/**
 * Google Analytics 4 snippet — activate by setting BARNARD_GA4_ID above.
 */
add_action( 'wp_head', 'barnard_ga4_snippet', 1 );
function barnard_ga4_snippet() {
    $id = BARNARD_GA4_ID;
    if ( ! $id || 'G-XXXXXXXXXX' === $id ) {
        return;
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
 * Obfuscate plain-text email addresses in rendered content.
 */
add_filter( 'the_content', 'barnard_obfuscate_emails' );
add_filter( 'widget_text', 'barnard_obfuscate_emails' );
add_filter( 'elementor/widget/render_content', 'barnard_obfuscate_emails', 20 );
function barnard_obfuscate_emails( $content ) {
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
 * Strip emoji & oEmbed scripts (performance).
 */
add_action( 'init', 'barnard_disable_emojis' );
function barnard_disable_emojis() {
    remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
    remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
    remove_action( 'wp_print_styles', 'print_emoji_styles' );
    remove_action( 'admin_print_styles', 'print_emoji_styles' );
    remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
    remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
    remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
}

/**
 * Journal/Media page — client-side category filter (vanilla JS, no jQuery).
 *
 * Filter pills use hrefs like #filter-sustainability. Matches WP category
 * class names on each post card. No AJAX, no page reload.
 */
add_action( 'wp_footer', 'barnard_media_filter_script' );
function barnard_media_filter_script() {
    if ( ! is_page( array( 'journal', 'media', 'media-and-press' ) ) ) {
        return;
    }
    ?>
    <script>
    (function(){
        function init(){
            var pills = document.querySelectorAll('a[href^="#filter-"]');
            var grid  = document.querySelector('.barnard-media-grid .elementor-posts-container');
            if (!pills.length || !grid) return;
            var posts = grid.querySelectorAll('.elementor-post');

            function apply(slug){
                posts.forEach(function(p){
                    if (slug === 'all' || p.classList.contains('category-' + slug)) {
                        p.removeAttribute('data-barnard-hidden');
                    } else {
                        p.setAttribute('data-barnard-hidden', '1');
                    }
                });
                pills.forEach(function(a){
                    var s = (a.getAttribute('href') || '').replace('#filter-', '');
                    if (s === slug) a.classList.add('is-active');
                    else a.classList.remove('is-active');
                });
                if (history.replaceState) history.replaceState(null, '', '#filter-' + slug);
            }

            pills.forEach(function(a){
                a.addEventListener('click', function(e){
                    e.preventDefault();
                    apply((a.getAttribute('href') || '').replace('#filter-', ''));
                });
            });

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
