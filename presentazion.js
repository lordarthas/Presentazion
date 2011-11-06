/* Presentazion
   HTML/JS software to present slides in DWIM way
   Version 0.30 - November 2nd, 2011
   First released on November 1st, 2011
   Author: Michele Beltrame
   License: Artistic (Perl5) or GPL3, at user choice
*/

Presentazion = {
    // Pad a bit to avoid  being too near to borders
    // (projectors might cut)
    window_hpadding : 50,
    // Some vpadding to fix an issue with Chromium
    window_vpadding : 50, // px
    // Keep this not too small, so calculation is faster
    font_step       : 10,

    init : function() {
        this.current_slide = 0,
        this.max_slide = $(".slide").size() - 1;
        this.last_search = '';

        this.preprocess_slides_contents();

        // Printing
        if ( $("#mediatype").css("width") === "2px" ) {
            this.set_print_text_size();
            return;
        
        }

        // Presenting
        $(".slide").hide();
        this.bind_keyboard_events();
        $(window).resize($.proxy(function() {
            this.set_text_size(current_slide);
        }), this);
        this.change_slide(0);
    },

    set_text_size : function(nslide) {
        var $slide = $(".slide:eq(" + nslide + ")");

        $(".slideshow").css("width", ($(window).width())+"px");
        $(".slideshow").css("height", ($(window).height())+"px");
        var divw = $(".slideshow").width();
        var divh = $(".slideshow").height();

        // Enlarge font size until slide fills the container
        // Increment by chunks of 10 to make it faster
        for ( var fsize = 10; fsize < 1000; fsize += this.font_step) {
            // Never allow contents to reach container boundaries
            $slide.css("font-size", fsize+"px");
            
            if ( $slide.width() >= (divw - this.window_hpadding*2) || $slide.height() >= (divh - this.window_vpadding*2) ) {
                $slide.css("font-size", (fsize - this.font_step)+"px");
                break;
            }
        }

        // Center contents vertically
        $slide.css( "margin-top", ((divh/2)-($slide.height()/2))+"px" );
    },

    set_print_text_size : function(nslide) {
        var divw = $(".slide").width();
        var divh = $(".slide").height();

        $(".slide").each(function(i, el) {
            // Enlarge font size until slide fills the container
            // Increment by chunks of 10 to make it faster
            var $slide = $(el);
            $slide.wrapInner('<div class="innerslide" style="display:inline-block;width:auto;height:auto;">');
            var $innerslide = $slide.children(".innerslide");
            for ( var fsize = 10; fsize < 1000; fsize += font_step) {
                // Never allow contents to reach container boundaries
                $innerslide.css("font-size", fsize+"px");
                
                if ( $innerslide.width() >= (divw - window_hpadding*2) || $innerslide.height() >= (divh - window_vpadding*2) ) {
                    $innerslide.css("font-size", (fsize-font_step)+"px");
                    break;
                }
            }
            console.log($innerslide.width() + " --- " + $innerslide.height());
            // Center contents vertically
            $innerslide.css( "margin-top", ((divh/2)-($innerslide.height()/2))+"px" );
        });
    },

    change_slide : function(num) {
        $(".slide:eq(" + this.current_slide + ")").hide();
        this.current_slide = num;
        $(".slide:eq(" + this.current_slide + ")").show();
        this.set_text_size(this.current_slide);
    },

    preprocess_slides_contents : function() {
        // Wrap CODE contents into PREs, and replace the CODE tag with a div
        // (so it doesn't bring "custom" formatting with it)
        $(".slide code").each(function(i, el) {
            $(el).replaceWith('<div class="codewrapper"><pre>' + $(el).html() + "</pre></div>");
        });

        // Wrap ULs and OLs
        $(".slide ul").wrap('<div class="ulwrapper">');
        $(".slide ol").wrap('<div class="olwrapper">');
    },

    bind_keyboard_events : function() {
        $(document).keydown($.proxy(function(e) {
            switch (e.keyCode) {
                case 13: // Enter
                case 32: // Space
                case 34: // PgDown
                case 39: // Right
                    if ( this.current_slide == this.max_slide ) {
                        return;
                    }
                    this.change_slide( this.current_slide + 1 );
                    e.preventDefault();
                    break;
                case 8:  // Backspace
                case 33: // PgUp
                case 37: // Left
                    if ( this.current_slide == 0 ) {
                        return;
                    }
                    this.change_slide( this.current_slide - 1 );
                    e.preventDefault();
                    break;
                case 74: // j
                    var nto_str = prompt("Enter slide number to jump to (1-" + (this.max_slide+1) + ")", "1");
                    var nto = parseInt(nto_str);
                    if ( nto && nto > 0 && nto <= (max_slide+1) ) {
                        this.change_slide( nto - 1 );
                        e.preventDefault();
                    }
                    break;
                case 83: // s
                    this.last_search = prompt("Enter string to search (forward)", this.last_search);
                    var pattern = new RegExp(this.last_search, "i"); // case insensitive
                    $(".slide:gt(" + this.current_slide + ")").each($.proxy(function(i, el) {
                        if ( $(el).text().match(pattern) ) {
                            this.change_slide( i + 1 );
                            return false;                    
                        }
                    },this));
                    e.preventDefault();
                    break;
                case 78: // n
                    alert("Current slide: " + (this.current_slide+1));
                    e.preventDefault();
                    break;
                case 72: // h
                    alert("COMMANDS\n\n"
                        + "PgDown/Space/Enter/Right: next slide\n"
                        + "PgUp/Backspace/Left: previous slide\n"
                        + "j: jump to page\n"
                        + "s: search (forward, no wrap)\n"
                        + "h: this help\n"
                    );
                    e.preventDefault();
                    break;
                default:
                    break;
            }
            return true; // don't stop other keys to be handled by browser
        }, this));
    }
};

$(function() {
    Presentazion.init();
});
