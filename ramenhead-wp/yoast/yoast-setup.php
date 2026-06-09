<?php
/**
 * Yoast SEO setup — Ramenhead.
 *
 * One-shot configuration of Yoast's global options. Use this if the
 * yoast-settings.ini import errors out on your version of Yoast (the
 * INI parser has changed format between releases).
 *
 * Two ways to run this:
 *
 *   A) Install the free "Code Snippets" plugin, paste this file's contents
 *      (everything below the opening <?php tag) into a new snippet, set it
 *      to "Only run once" (or run it manually then disable), save & activate.
 *
 *   B) FTP this file into wp-content/mu-plugins/ — it will run on the next
 *      page load, then you can delete it.
 *
 * It populates the same three Yoast option groups the INI file targets:
 *  - wpseo (site representation)
 *  - wpseo_titles (title/meta templates, breadcrumbs, indexing rules)
 *  - wpseo_social (Open Graph, Twitter cards, social profile URLs)
 *
 * Safe to run multiple times — uses update_option() which merges.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'plugins_loaded', function () {
    if ( ! is_admin() ) return;
    if ( ! current_user_can( 'manage_options' ) ) return;
    if ( get_option( 'ramenhead_yoast_setup_done' ) ) return;
    if ( ! function_exists( 'wpseo_admin_init' ) && ! defined( 'WPSEO_VERSION' ) ) return;

    $site_url = trailingslashit( home_url() );
    $upload   = $site_url . 'wp-content/uploads/ramenhead/';

    // -- Site representation (wpseo) --
    $wpseo = get_option( 'wpseo', array() );
    $wpseo = array_merge( $wpseo, array(
        'website_name'           => 'Ramenhead',
        'alternate_website_name' => 'Ramenhead Cape Town',
        'company_or_person'      => 'company',
        'company_name'           => 'Ramenhead',
        'company_alternate_name' => 'Ramenhead Cape Town',
        'company_logo'           => $upload . 'logo.png',
        'enable_text_link_counter' => true,
        'enable_admin_bar_menu'  => true,
    ) );
    update_option( 'wpseo', $wpseo );

    // -- Titles / indexing / breadcrumbs (wpseo_titles) --
    $titles = get_option( 'wpseo_titles', array() );
    $titles = array_merge( $titles, array(
        'separator' => 'sc-pipe',

        'title-home-wpseo'    => 'Ramenhead | Authentic Japanese Ramen in Cape Town',
        'metadesc-home-wpseo' => 'Authentic Japanese ramen in Cape Town. Freshly made noodles and 48-hour broths at Speaker\'s Corner, 37 Parliament St. Book your slurp today.',

        'title-page'    => '%%title%% %%sep%% %%sitename%%',
        'metadesc-page' => '',
        'noindex-page'  => false,

        'title-post'    => '%%title%% %%sep%% %%sitename%%',
        'metadesc-post' => '',
        'noindex-post'  => false,

        // Attachment URLs — never indexed
        'title-attachment'   => '%%title%% %%sep%% %%sitename%%',
        'noindex-attachment' => true,
        'disable-attachment' => true,

        // Category archives — index (used by press section)
        'title-tax-category'    => '%%term_title%% Press %%sep%% %%sitename%%',
        'metadesc-tax-category' => '%%term_description%%',
        'noindex-tax-category'  => false,

        // Tags — noindex (unused)
        'title-tax-post_tag'   => '%%term_title%% %%sep%% %%sitename%%',
        'noindex-tax-post_tag' => true,

        // Author archives — single-author site, noindex
        'title-author-wpseo'   => '%%name%%, Author at %%sitename%%',
        'noindex-author-wpseo' => true,
        'disable-author'       => true,

        // Date archives — noindex
        'title-archive-wpseo'   => '%%date%% Archives %%sep%% %%sitename%%',
        'noindex-archive-wpseo' => true,
        'disable-date'          => true,

        // Search / 404
        'title-search-wpseo' => 'Search for "%%searchphrase%%" %%sep%% %%sitename%%',
        'title-404-wpseo'    => 'Page not found %%sep%% %%sitename%%',

        // Breadcrumbs
        'breadcrumbs-enable'         => true,
        'breadcrumbs-sep'            => '/',
        'breadcrumbs-home'           => 'Home',
        'breadcrumbs-archiveprefix'  => 'Press archives:',
        'breadcrumbs-searchprefix'   => 'You searched for',
        'breadcrumbs-404crumb'       => 'Page not found',

        // Use category as primary taxonomy for posts
        'post_types-post-maintax' => 'category',
    ) );
    update_option( 'wpseo_titles', $titles );

    // -- Social (wpseo_social) --
    $social = get_option( 'wpseo_social', array() );
    $social = array_merge( $social, array(
        'opengraph'         => true,
        'twitter'           => true,
        'twitter_card_type' => 'summary_large_image',

        'og_default_image'   => $upload . 'RAMENHEAD-WS-PIC-02.jpg',
        'og_frontpage_title' => 'Ramenhead | Authentic Japanese Ramen in Cape Town',
        'og_frontpage_desc'  => 'Freshly made noodles and 48-hour broths at Speaker\'s Corner, Cape Town.',
        'og_frontpage_image' => $upload . 'RAMENHEAD-WS-PIC-02.jpg',

        'facebook_site'  => 'https://www.facebook.com/ramenhead.za',
        'instagram_url'  => 'https://www.instagram.com/ramenhead.za/',
        'twitter_site'   => '',
        'linkedin_url'   => '',
        'pinterest_url'  => '',
        'youtube_url'    => '',
        'wikipedia_url'  => '',
    ) );
    update_option( 'wpseo_social', $social );

    // Mark done so this only runs once.
    update_option( 'ramenhead_yoast_setup_done', time() );

    // Optional: trigger an admin notice so you know it worked.
    add_action( 'admin_notices', function () {
        echo '<div class="notice notice-success is-dismissible"><p>'
           . '<strong>Ramenhead:</strong> Yoast SEO settings applied. '
           . 'Visit <a href="' . esc_url( admin_url( 'admin.php?page=wpseo_dashboard' ) ) . '">SEO → Settings</a> to verify.'
           . '</p></div>';
    } );
} );
