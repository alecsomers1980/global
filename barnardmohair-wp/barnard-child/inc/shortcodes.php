<?php
/**
 * Helper shortcodes for Elementor HTML widgets / page content.
 *
 * @package BarnardMohair
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * [barnard_whatsapp]
 * [barnard_whatsapp text="Chat with us" number="+27730392013"]
 */
add_shortcode( 'barnard_whatsapp', 'barnard_sc_whatsapp' );
function barnard_sc_whatsapp( $atts ) {
    $a = shortcode_atts(
        array(
            'text'   => 'WhatsApp Us',
            'number' => '+27730392013',
        ),
        $atts,
        'barnard_whatsapp'
    );
    $clean = preg_replace( '/[^0-9+]/', '', $a['number'] );
    return sprintf(
        '<a class="barnard-btn barnard-btn--whatsapp" href="https://wa.me/%s" target="_blank" rel="noopener noreferrer">%s</a>',
        esc_attr( ltrim( $clean, '+' ) ),
        esc_html( $a['text'] )
    );
}

/**
 * [barnard_shop_now]
 * [barnard_shop_now text="View Collection" url="/shop-default/"]
 */
add_shortcode( 'barnard_shop_now', 'barnard_sc_shop_now' );
function barnard_sc_shop_now( $atts ) {
    $a = shortcode_atts(
        array(
            'text' => 'Shop Now',
            'url'  => '/shop-default/',
        ),
        $atts,
        'barnard_shop_now'
    );
    return sprintf(
        '<a class="barnard-btn" href="%s">%s</a>',
        esc_url( home_url( $a['url'] ) ),
        esc_html( $a['text'] )
    );
}

/**
 * [barnard_contact]
 */
add_shortcode( 'barnard_contact', 'barnard_sc_contact' );
function barnard_sc_contact( $atts ) {
    ob_start();
    ?>
    <div class="barnard-contact">
        <p>WhatsApp: <a href="https://wa.me/27730392013">+27 73 039 2013</a></p>
        <p>Email: <a href="mailto:<?php echo antispambot( 'info@barnardmohair.com' ); ?>"><?php echo antispambot( 'info@barnardmohair.com' ); ?></a></p>
        <p>Location: Alicedale, Eastern Cape, South Africa</p>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * [barnard_care_guide]
 */
add_shortcode( 'barnard_care_guide', 'barnard_sc_care_guide' );
function barnard_sc_care_guide( $atts ) {
    return sprintf(
        '<a class="barnard-link" href="%s">View our Mohair Care Guide</a>',
        esc_url( home_url( '/care-guide/' ) )
    );
}

/**
 * [barnard_factory_visits]
 */
add_shortcode( 'barnard_factory_visits', 'barnard_sc_factory_visits' );
function barnard_sc_factory_visits( $atts ) {
    ob_start();
    ?>
    <div class="barnard-factory">
        <p>We welcome visitors to our Alicedale workshop by appointment.</p>
        <a class="barnard-btn" href="<?php echo esc_url( home_url( '/factory-visits/' ) ); ?>">Plan a Visit</a>
    </div>
    <?php
    return ob_get_clean();
}
