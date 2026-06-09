<?php
/**
 * Helper shortcodes for Elementor HTML widgets / page content.
 *
 * @package Ramenhead
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * [ramenhead_book_now]
 * [ramenhead_book_now text="RESERVE A TABLE" url="https://..."]
 */
add_shortcode( 'ramenhead_book_now', 'ramenhead_sc_book_now' );
function ramenhead_sc_book_now( $atts ) {
    $a = shortcode_atts(
        array(
            'text' => 'BOOK NOW',
            'url'  => 'https://www.dineplan.com/restaurants/ramenhead',
        ),
        $atts,
        'ramenhead_book_now'
    );
    return sprintf(
        '<a class="rh-btn" href="%s" target="_blank" rel="noopener noreferrer">%s</a>',
        esc_url( $a['url'] ),
        esc_html( $a['text'] )
    );
}

/**
 * [ramenhead_hours]
 */
add_shortcode( 'ramenhead_hours', 'ramenhead_sc_hours' );
function ramenhead_sc_hours( $atts ) {
    ob_start();
    ?>
    <div class="rh-hours">
        <h5>DINNER</h5>
        <p>Tues–Sat 5–10pm</p>
        <h5>RAMENHEAD HAPPY HOUR</h5>
        <p>Weekdays 5–7pm</p>
        <p>50% off all small plates &amp; selected cocktails.</p>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * [ramenhead_locations]
 */
add_shortcode( 'ramenhead_locations', 'ramenhead_sc_locations' );
function ramenhead_sc_locations( $atts ) {
    ob_start();
    ?>
    <div class="rh-locations">
        <div class="rh-loc">
            <h5>Speaker's Corner</h5>
            <p>37 Parliament Street<br>Cape Town, 8001</p>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * [ramenhead_contact]
 */
add_shortcode( 'ramenhead_contact', 'ramenhead_sc_contact' );
function ramenhead_sc_contact( $atts ) {
    ob_start();
    ?>
    <div class="rh-contact">
        <p>WhatsApp: <a href="https://wa.me/27673128061">+27 67 312 8061</a></p>
        <p>Email: <a href="mailto:info@ramenhead.co.za">info@ramenhead.co.za</a></p>
    </div>
    <?php
    return ob_get_clean();
}
