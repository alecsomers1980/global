<?php
/**
 * AI agent discovery: robots.txt + llms.txt.
 *
 * Serves both as virtual routes so they work even without physical files
 * at the web root. If a physical file IS dropped at the root later it
 * takes precedence (WP's robots_txt filter is bypassed by a real /robots.txt;
 * the llms.txt rewrite is conditional).
 *
 * @package BarnardMohair
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Override WordPress's virtual robots.txt with an AI-aware version.
 */
add_filter( 'robots_txt', 'barnard_robots_txt', 99, 2 );
function barnard_robots_txt( $output, $public ) {
    if ( '0' === (string) $public ) {
        return $output;
    }
    $site_url = trailingslashit( home_url() );
    $ai_bots  = array(
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
        '# Barnard Mohair — robots.txt (served by Barnard Mohair child theme)',
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
        '# Explicitly allowed so Barnard Mohair surfaces in AI-generated answers.',
    );
    foreach ( $ai_bots as $bot ) {
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
 */
add_action( 'init', 'barnard_register_llms_endpoint' );
function barnard_register_llms_endpoint() {
    add_rewrite_rule( '^llms\.txt$', 'index.php?barnard_llms=1', 'top' );
}

add_filter( 'query_vars', function ( $vars ) {
    $vars[] = 'barnard_llms';
    return $vars;
} );

add_action( 'template_redirect', 'barnard_serve_llms_txt' );
function barnard_serve_llms_txt() {
    if ( ! get_query_var( 'barnard_llms' ) ) {
        return;
    }
    $file = BARNARD_DIR . 'inc/llms.txt';
    if ( ! file_exists( $file ) ) {
        status_header( 404 );
        exit;
    }
    header( 'Content-Type: text/plain; charset=utf-8' );
    header( 'X-Robots-Tag: noindex' );
    header( 'Cache-Control: public, max-age=3600' );
    readfile( $file );
    exit;
}

/**
 * Flush rewrites on theme activation so /llms.txt resolves immediately.
 */
add_action( 'after_switch_theme', 'barnard_flush_rewrites' );
function barnard_flush_rewrites() {
    barnard_register_llms_endpoint();
    flush_rewrite_rules( false );
}
