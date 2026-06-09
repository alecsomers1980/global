<?php
/**
 * AI agent discovery: robots.txt + llms.txt.
 *
 * Serves both as virtual routes so they work even if no physical file
 * exists at the web root. If a physical file IS dropped at the root
 * later, it takes precedence (WP's robots_txt filter is bypassed by a
 * real /robots.txt; the llms.txt rewrite is conditional).
 *
 * @package Ramenhead
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Override WordPress's virtual robots.txt with our AI-aware version.
 */
add_filter( 'robots_txt', 'ramenhead_robots_txt', 99, 2 );
function ramenhead_robots_txt( $output, $public ) {
    if ( '0' === (string) $public ) {
        // Site is set to discourage search engines — respect that.
        return $output;
    }
    $site_url = trailingslashit( home_url() );
    $allowed_ai_bots = array(
        'GPTBot', 'ChatGPT-User', 'OAI-SearchBot',
        'ClaudeBot', 'anthropic-ai', 'Claude-Web',
        'PerplexityBot', 'Perplexity-User',
        'Google-Extended',
        'Applebot', 'Applebot-Extended',
        'Bytespider', 'CCBot', 'cohere-ai',
        'Meta-ExternalAgent', 'Meta-ExternalFetcher',
        'DuckAssistBot', 'YouBot', 'Diffbot',
    );
    $lines = array(
        '# Ramenhead — robots.txt (served by Ramenhead child theme)',
        '',
        '# ---------- General web crawlers ----------',
        'User-agent: *',
        'Disallow: /wp-admin/',
        'Disallow: /wp-includes/',
        'Disallow: /xmlrpc.php',
        'Disallow: /wp-login.php',
        'Disallow: /?s=',
        'Disallow: /*?*orderby=',
        'Allow: /wp-admin/admin-ajax.php',
        'Allow: /',
        '',
        '# ---------- AI agents and LLM crawlers ----------',
        '# Explicitly allowed so Ramenhead surfaces in AI-generated answers.',
    );
    foreach ( $allowed_ai_bots as $bot ) {
        $lines[] = '';
        $lines[] = 'User-agent: ' . $bot;
        $lines[] = 'Allow: /';
    }
    $lines[] = '';
    $lines[] = '# ---------- Sitemap & LLM index ----------';
    $lines[] = 'Sitemap: ' . $site_url . 'sitemap_index.xml';
    $lines[] = 'Sitemap: ' . $site_url . 'llms.txt';

    return implode( "\n", $lines ) . "\n";
}

/**
 * Register a virtual /llms.txt endpoint.
 * Reads from inc/llms.txt inside the theme — edit that file to update.
 */
add_action( 'init', 'ramenhead_register_llms_endpoint' );
function ramenhead_register_llms_endpoint() {
    add_rewrite_rule( '^llms\.txt$', 'index.php?ramenhead_llms=1', 'top' );
}

add_filter( 'query_vars', function ( $vars ) {
    $vars[] = 'ramenhead_llms';
    return $vars;
} );

add_action( 'template_redirect', 'ramenhead_serve_llms_txt' );
function ramenhead_serve_llms_txt() {
    if ( ! get_query_var( 'ramenhead_llms' ) ) {
        return;
    }
    $file = RAMENHEAD_DIR . 'inc/llms.txt';
    if ( ! file_exists( $file ) ) {
        status_header( 404 );
        exit;
    }
    header( 'Content-Type: text/plain; charset=utf-8' );
    header( 'X-Robots-Tag: noindex' );  // the file itself shouldn't be indexed
    header( 'Cache-Control: public, max-age=3600' );
    readfile( $file );
    exit;
}

/**
 * Flush rewrites once on theme activation so /llms.txt resolves
 * without the admin needing to visit Settings -> Permalinks.
 */
add_action( 'after_switch_theme', 'ramenhead_flush_rewrites' );
function ramenhead_flush_rewrites() {
    ramenhead_register_llms_endpoint();
    flush_rewrite_rules( false );
}
