// src/liqua.js
(function($) {
    'use strict';

    // ========================================================================
    // 1. ÇEKİRDEK (MOTORUN KURULUMU)
    // ========================================================================
    function Liqua(element, options) {
        this.$el = $(element);

        // Ayarları birleştir (Varsayılanlar + Kullanıcıdan Gelenler)
        this.options = $.extend({}, this.defaults, options);

        // -- HAFIZA DEPOLARI --
        this.actions = {};      // Kural (Fonksiyon) Deposu
        this.middlewares = {};  // Ara Katman (Before/After) Deposu
        this.state = {};        // YENİ: Global Veri (State) Deposu

        // -- HTTP (AJAX) SERVİSİ (YENİ) --
        // Geliştirici app.http.post() veya app.http.get() diyerek kolayca istek atsın diye.
        let self = this;
        this.http = {
            get: function(url, data) { return self._makeRequest('GET', url, data); },
            post: function(url, data) { return self._makeRequest('POST', url, data); }
        };

        if (this.options.debugMode) {
            console.log("🚀 Liqua Framework Başarıyla Başlatıldı:", this.$el);
        }
    }

    // Varsayılan Ayarlar
    Liqua.prototype.defaults = {
        debugMode: true
    };


    // ========================================================================
    // 2. STATE (GLOBAL DURUM) YÖNETİMİ - "Sihirli HTML Güncelleyici"
    // ========================================================================
    
    // Veriyi kaydeder ve HTML'de o veriyi dinleyen her yeri OTOMATİK günceller
    Liqua.prototype.setState = function(key, value) {
        this.state[key] = value; // Hafızaya al
        
        if (this.options.debugMode) {
            console.log(`📦 [Liqua State] '${key}' verisi değişti -> Yeni değer:`, value);
        }

        // HTML içinde [data-liqua-bind="sepetSayisi"] gibi etiketi olanları bul ve güncelle
        this.$el.find('[data-liqua-bind="' + key + '"]').each(function() {
            let $hedef = $(this);
            
            // Eğer bu bir input veya select ise 'value' değerini değiştir
            if ($hedef.is('input, textarea, select')) {
                $hedef.val(value);
            } else {
                // Değilse (div, span, p vb.) doğrudan içindeki yazıyı değiştir
                $hedef.text(value);
            }
        });

        return this; // Zincirleme kullanım için
    };

    // Hafızadaki veriyi okumak için
    Liqua.prototype.getState = function(key) {
        return this.state[key];
    };


    // ========================================================================
    // 3. HTTP (AJAX) SERVİSİ
    // ========================================================================
    
    Liqua.prototype._makeRequest = function(method, url, data) {
        let self = this;
        
        if (this.options.debugMode) {
            console.log(`🌐 [Liqua HTTP] ${method} İsteği Gidiyor ->`, url, data);
        }

        // jQuery Ajax'ı modern bir Promise (Söz) yapısına sarıyoruz
        return $.ajax({
            url: url,
            method: method,
            data: data,
            beforeSend: function() {
                // Sayfaya otomatik olarak "yükleniyor" class'ı ekle (CSS ile animasyon yapılabilir)
                self.$el.addClass('liqua-loading');
            },
            complete: function() {
                // İşlem bitince yükleniyor class'ını sil
                self.$el.removeClass('liqua-loading');
            }
        }).fail(function(error) {
            console.error("❌ [Liqua HTTP Hatası] Sunucuya ulaşılamadı!", error);
        });
    };


    // ========================================================================
    // 4. KURAL (ACTION) ve ARA KATMAN (MIDDLEWARE) YÖNETİMİ
    // ========================================================================

    // Sisteme yeni bir kural (görev) öğretir
    Liqua.prototype.addAction = function(actionName, callback) {
        this.actions[actionName] = callback;
        this.middlewares[actionName] = { before: [], after: [] }; // Ara katmanlar için boş kuyruk aç
        return this;
    };

    // Mevcut bir çekirdek kuralı sadece bu site için ezer/değiştirir
    Liqua.prototype.overrideAction = function(actionName, newCallback) {
        if (this.actions[actionName]) {
            this.actions[actionName] = newCallback;
            console.warn(`⚠️ [Liqua Bilgi] '${actionName}' kuralı bu site için EZİLDİ (Overridden).`);
        }
        return this;
    };

    // Kural çalışmadan önce (before) veya sonra (after) araya girecek fonksiyonlar ekler
    Liqua.prototype.addMiddleware = function(actionName, position, callback) {
        if (this.middlewares[actionName] && this.middlewares[actionName][position]) {
            this.middlewares[actionName][position].push(callback);
        }
        return this;
    };

    // Birden fazla kurala aynı anda ara katman eklemek için (Toplu atama)
    Liqua.prototype.group = function(actionsArray, middlewares) {
        let self = this;
        actionsArray.forEach(function(actionName) {
            if (middlewares.before) self.addMiddleware(actionName, 'before', middlewares.before);
            if (middlewares.after)  self.addMiddleware(actionName, 'after', middlewares.after);
        });
        return this;
    };


    // ========================================================================
    // 5. ROUTER (HTML İLE SİSTEMİ BAĞLAYAN OTOMATİK KÖPRÜ)
    // ========================================================================

    // Tıklama, form gönderme gibi olayları yakalayıp otomatik kural tetikler
    Liqua.prototype.bindEvent = function(eventType, selector, actionName) {
        let self = this;

        this.$el.on(eventType, selector, function(e) {
            if (eventType === 'submit' || $(this).is('a')) e.preventDefault();

            let autoPayload = $(this).data();

            if ($(this).is('form')) {
                $(this).serializeArray().forEach(function(item) {
                    autoPayload[item.name] = item.value;
                });
            }

            // MİMARİ DÜZELTME BURADA: 
            // HTML elementini ve olayı payload'a değil, extraContext adında ayrı bir pakete koyuyoruz!
            let extraContext = {
                triggerElement: this, 
                originalEvent: e
            };

            if (self.options.debugMode) {
                console.log(`🎯 [Liqua Router] '${eventType}' yakalandı -> '${actionName}' başlatılıyor. Veri:`, autoPayload);
            }

            // Motoru Ateşle! (Üçüncü parametre olarak ekstra bağlamı gönder)
            self.run(actionName, autoPayload, extraContext);
        });

        return this;
    };


    // ========================================================================
    // 6. ANA MOTOR (RUNNER - KURALLARI İŞLETEN FABRİKA)
    // ========================================================================

    Liqua.prototype.run = function(actionName, payload, extraContext) {
        if (!this.actions[actionName]) {
            console.error(`❌ [Liqua Hatası] '${actionName}' adında bir kural bulunamadı!`);
            return false;
        }

        let self = this;
        let context = {
            element: this.$el,
            payload: payload || {}, 
            result: null,           
            cancel: false 
        };

        // YENİ SİHİR: Router'dan gelen ekstra veriler (butonun kendisi vb.) varsa,
        // bunları doğrudan context'in içine yapıştır. Payload'ı kirletme!
        if (extraContext) {
            $.extend(context, extraContext);
        }

        // --- AŞAĞISI AYNI KALIYOR ---
        this.middlewares[actionName].before.forEach(function(mw) {
            if (!context.cancel) mw.call(self, context);
        });

        if (!context.cancel) {
            context.result = this.actions[actionName].call(this, context);
        } else {
            console.warn(`🛑 [Liqua Uyarısı] '${actionName}' işlemi bir Ara Katman tarafından İPTAL edildi.`);
            return false;
        }

        this.middlewares[actionName].after.forEach(function(mw) {
            mw.call(self, context);
        });

        return context.result;
    };


    // ========================================================================
    // 7. JQUERY'E BAĞLAMA (KÖPRÜ)
    // ========================================================================
    $.fn.liqua = function(options) {
        let instance = $.data(this[0], "plugin_liqua");
        if (!instance) {
            instance = new Liqua(this[0], options);
            $.data(this[0], "plugin_liqua", instance);
        }
        return instance; 
    };

})(jQuery);