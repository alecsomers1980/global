<?php
/**
 * Plugin Name: Barnard Mohair — Yoast SEO Setup
 * Plugin URI:  https://barnardmohair.com
 * Description: One-time Yoast SEO configuration. Activate → confirm notice → deactivate → delete.
 * Version:     1.0.0
 * Author:      Antigravity
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/* ============================================================
   RUN ON PLUGIN ACTIVATION
   ============================================================ */
register_activation_hook( __FILE__, 'bm_yoast_setup_run' );

function bm_yoast_setup_run() {

    /* --------------------------------------------------------
       1. GENERAL — Site representation (wpseo)
       SEO → General → Site representation
    -------------------------------------------------------- */
    $wpseo = get_option( 'wpseo', array() );

    $wpseo['company_or_person'] = 'company';
    $wpseo['company_name']      = 'Barnard Mohair';
    $wpseo['website_name']      = 'Barnard Mohair';
    // company_logo requires an attachment ID — set manually in Yoast after activation:
    // SEO → General → Site representation → Organisation logo

    update_option( 'wpseo', $wpseo );

    /* --------------------------------------------------------
       2. TITLES & META (wpseo_titles)
       SEO → Search Appearance
    -------------------------------------------------------- */
    $titles = get_option( 'wpseo_titles', array() );

    // ---- Separator ----
    // sc-mdash = — (em-dash). Matches the brand title style.
    $titles['separator'] = 'sc-mdash';

    // ---- Homepage title + meta description ----
    // These apply when the front page is a static page.
    // We also set post meta on the actual page below (step 5).
    $titles['title-home-wpseo']    = 'Barnard Mohair — Handcrafted Mohair Blankets, Jackets & Scarves';
    $titles['metadesc-home-wpseo'] = 'South African heirloom mohair products handcrafted in Alicedale since 1967. Blankets, jackets and scarves from Eastern Cape Angora goats. Ships worldwide.';

    // ---- Post (Journal articles) templates ----
    $titles['title-post']    = '%%title%% %%sep%% Barnard Mohair';
    $titles['metadesc-post'] = '%%excerpt%%';

    // ---- Page templates ----
    $titles['title-page']    = '%%title%% %%sep%% Barnard Mohair';
    $titles['metadesc-page'] = '';

    // ---- WooCommerce product templates ----
    $titles['title-product']    = '%%title%% %%sep%% Barnard Mohair';
    $titles['metadesc-product'] = '%%excerpt%%';

    // ---- Product category templates ----
    $titles['title-tax-product_cat']    = '%%term_title%% %%sep%% Barnard Mohair';
    $titles['metadesc-tax-product_cat'] = 'Shop %%term_title%% from Barnard Mohair. Handcrafted from locally sourced Eastern Cape Angora goat fibre since 1967.';

    // ---- Noindex thin content ----
    // Date archives and author pages have no standalone SEO value.
    $titles['noindex-author-wpseo']  = true;
    $titles['noindex-archive-wpseo'] = true;
    $titles['noindex-tax-post_tag']  = true;

    // ---- Breadcrumbs ----
    $titles['breadcrumbs-enable']      = true;
    $titles['breadcrumbs-home-anchor'] = 'Home';
    $titles['breadcrumbs-boldlast']    = true;
    $titles['breadcrumbs-sep']         = ' &rsaquo; ';

    update_option( 'wpseo_titles', $titles );

    /* --------------------------------------------------------
       3. SOCIAL / OPEN GRAPH (wpseo_social)
       SEO → Social
    -------------------------------------------------------- */
    $social = get_option( 'wpseo_social', array() );

    $social['facebook_site']       = 'https://www.facebook.com/profile.php?id=100057658869744';
    $social['instagram_url']       = 'https://www.instagram.com/barnard_mohair';
    $social['twitter_site']        = '';   // no X/Twitter account
    $social['og_default_image']    = '';   // set manually: upload a 1200×630 brand image
    $social['og_default_image_id'] = 0;

    // Open Graph is enabled by default in Yoast; confirm these are on:
    $social['opengraph'] = true;

    update_option( 'wpseo_social', $social );

    /* --------------------------------------------------------
       4. KNOWLEDGE GRAPH — social profiles for Organisation schema
       These appear in the @graph Organisation node sameAs array.
    -------------------------------------------------------- */
    $wpseo = get_option( 'wpseo', array() );

    $wpseo['facebook_site']   = 'https://www.facebook.com/profile.php?id=100057658869744';
    $wpseo['instagram_url']   = 'https://www.instagram.com/barnard_mohair';

    update_option( 'wpseo', $wpseo );

    /* --------------------------------------------------------
       5. FRONT PAGE — set title + meta as post meta on the
          actual homepage so Yoast picks them up in the editor.
    -------------------------------------------------------- */
    $front_page_id = (int) get_option( 'page_on_front' );

    if ( $front_page_id > 0 ) {
        update_post_meta(
            $front_page_id,
            '_yoast_wpseo_title',
            'Barnard Mohair — Handcrafted Mohair Blankets, Jackets & Scarves'
        );
        update_post_meta(
            $front_page_id,
            '_yoast_wpseo_metadesc',
            'South African heirloom mohair products handcrafted in Alicedale since 1967. Blankets, jackets and scarves from Eastern Cape Angora goats. Ships worldwide.'
        );
        update_post_meta(
            $front_page_id,
            '_yoast_wpseo_focuskw',
            'mohair blankets South Africa'
        );
    }

    /* --------------------------------------------------------
       6. ABOUT US PAGE — set as secondary key page
    -------------------------------------------------------- */
    $about_page = get_page_by_path( 'about-us' );
    if ( $about_page ) {
        update_post_meta(
            $about_page->ID,
            '_yoast_wpseo_title',
            'About Us %%sep%% Barnard Mohair — Alicedale, Eastern Cape'
        );
        update_post_meta(
            $about_page->ID,
            '_yoast_wpseo_metadesc',
            'Barnard Mohair is a second-generation family business founded in Alicedale in 1967 by Jan Paul Barnard. Handcrafted heirloom mohair products from the Eastern Cape.'
        );
        update_post_meta(
            $about_page->ID,
            '_yoast_wpseo_focuskw',
            'Barnard Mohair about us'
        );
    }

    /* --------------------------------------------------------
       7. CARE GUIDE PAGE
    -------------------------------------------------------- */
    $care_page = get_page_by_path( 'care-guide' );
    if ( $care_page ) {
        update_post_meta(
            $care_page->ID,
            '_yoast_wpseo_title',
            'Mohair Care Guide %%sep%% How to Wash & Store Mohair'
        );
        update_post_meta(
            $care_page->ID,
            '_yoast_wpseo_metadesc',
            'How to care for mohair blankets, jackets and scarves. Hand washing, drying, storage and tips to keep your mohair looking beautiful for generations.'
        );
        update_post_meta(
            $care_page->ID,
            '_yoast_wpseo_focuskw',
            'how to wash mohair'
        );
    }

    /* --------------------------------------------------------
       8. Flag as done for the admin notice
    -------------------------------------------------------- */
    update_option( 'bm_yoast_setup_done', array(
        'time'          => current_time( 'mysql' ),
        'front_page_id' => $front_page_id,
    ) );
}

/* ============================================================
   ADMIN NOTICE — confirms what ran and what still needs manual action
   ============================================================ */
add_action( 'admin_notices', 'bm_yoast_setup_notice' );

function bm_yoast_setup_notice() {
    $done = get_option( 'bm_yoast_setup_done' );
    if ( ! $done ) {
        return;
    }

    $front_id    = isset( $done['front_page_id'] ) ? (int) $done['front_page_id'] : 0;
    $settings_url = admin_url( 'admin.php?page=wpseo_page_settings' );
    $social_url   = admin_url( 'admin.php?page=wpseo_social_settings' );

    ?>
    <div class="notice notice-success" style="border-left-color:#2271b1;">
        <p>
            <strong>Barnard Mohair — Yoast SEO Setup Complete</strong>
            &mdash; Applied <?php echo esc_html( $done['time'] ); ?>
        </p>
        <p><strong>Automatically configured:</strong></p>
        <ul style="list-style:disc;padding-left:1.5em;margin-top:0;">
            <li>Site representation: Barnard Mohair (Company)</li>
            <li>Title separator: em-dash (—)</li>
            <li>Homepage title &amp; meta description</li>
            <li>Post / page / product / category title templates</li>
            <li>Facebook &amp; Instagram social profiles</li>
            <li>Breadcrumbs enabled</li>
            <li>Noindex: author pages, date archives, post tags</li>
            <?php if ( $front_id ) : ?>
                <li>Front page Yoast meta set on page ID <?php echo $front_id; ?></li>
            <?php else : ?>
                <li style="color:#c00;">Front page not set as a static page — go to Settings &rarr; Reading and set a static front page, then re-activate this plugin.</li>
            <?php endif; ?>
            <li>About Us + Care Guide page meta set</li>
        </ul>
        <p><strong>Still requires manual action:</strong></p>
        <ul style="list-style:disc;padding-left:1.5em;margin-top:0;">
            <li>
                <a href="<?php echo esc_url( $settings_url ); ?>">Yoast &rarr; General &rarr; Site representation</a>
                &mdash; upload the <strong>Organisation logo</strong> (square, min 112×112px)
            </li>
            <li>
                <a href="<?php echo esc_url( $social_url ); ?>">Yoast &rarr; Social &rarr; Facebook</a>
                &mdash; upload an <strong>OG default image</strong> (1200×630px brand photo)
            </li>
            <li>Homepage H1: in Elementor, change the hero headline tag from H2 to <strong>H1</strong></li>
        </ul>
        <p>
            <em>Once confirmed, deactivate and delete this plugin — it is not needed after first run.</em>
        </p>
    </div>
    <?php
}
