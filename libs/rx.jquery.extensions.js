

(function ($) {
    var proto = $.fn;

    //Wurde in Rx 1.0.10621 entfernt. Wir benötigen es aber
    proto.toObservable = proto.bindAsObservable;

})(jQuery);