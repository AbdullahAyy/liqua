# 🌊 Liqua Framework

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/jQuery-required-yellowgreen?style=for-the-badge&logo=jquery" alt="jQuery">
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/size-lightweight-orange?style=for-the-badge" alt="Lightweight">
</p>

> **Liqua**, çoklu site (multi-tenant) yapılarında kaosu bitirmek için tasarlanmış, jQuery tabanlı, hafif ama son derece yetenekli bir **Core Engine** geliştirme çatısıdır.

---

## 📋 İçindekiler

- [Kurulum](#-kurulum)
- [Başlangıç](#-başlangıç)
- [Temel Fonksiyonlar](#-temel-fonksiyonlar)
- [Ara Katmanlar (Middleware)](#-ara-katmanlar-middleware)
- [Olay Yönlendirici](#-olay-yönlendirici)
- [Durum Yönetimi](#-durum-yönetimi)
- [HTTP Servisi](#-http-servisi)
- [Context Objesi](#-context-objesi)
- [Kullanım Örneği](#-tam-kullanım-örneği)

---

## 📦 Kurulum

### CDN (Önerilen)

```html
<script src="https://cdn.jsdelivr.net/gh/AbdullahAyy/liqua@v1.0.0/dist/liqua.min.js"></script>
```

### npm

```bash
npm install liqua
```

> ⚠️ jQuery bağımlılığı gereklidir. Liqua'yı yüklemeden önce jQuery'nin sayfada mevcut olduğundan emin olun.

---

## 🚀 Başlangıç

Liqua'yı bir HTML elementine bağlayarak tüm gücünü o alan içinde kullanabilirsiniz.

```javascript
const app = $('#app').liqua({
    debugMode: true // Geliştirme aşamasında tüm logları konsolda görmenizi sağlar
});
```

| Seçenek     | Tip       | Varsayılan | Açıklama                              |
|-------------|-----------|------------|---------------------------------------|
| `debugMode` | `boolean` | `false`    | Konsol loglarını aktif eder           |

---

## 🏗️ Temel Fonksiyonlar

### `addAction(name, callback)`

Sisteme yeni bir "görev" öğretir. Bu görevler sistemin çekirdeğini oluşturur.

| Parametre  | Tip        | Açıklama                                          |
|------------|------------|---------------------------------------------------|
| `name`     | `string`   | Görevin adı                                       |
| `callback` | `function` | Çalışacak fonksiyon. `ctx` (context) objesi içerir |

```javascript
app.addAction('sepeteEkle', function(ctx) {
    const urunId = ctx.payload.urunId;
    console.log(`Ürün ${urunId} sepete eklendi.`);
});
```

---

### `overrideAction(name, newCallback)`

Liqua'nın en güçlü özelliklerinden biridir. Merkezi paketteki bir kuralı, sadece o siteye özel olarak **tamamen değiştirmenizi** sağlar. Ana koda dokunmadan siteyi özelleştirebilirsiniz.

| Parametre     | Tip        | Açıklama                  |
|---------------|------------|---------------------------|
| `name`        | `string`   | Değiştirilecek görevin adı |
| `newCallback` | `function` | Yeni çalışacak fonksiyon  |

```javascript
// Merkezi paketteki sepeteEkle aksiyonunu bu site için tamamen değiştir
app.overrideAction('sepeteEkle', function(ctx) {
    console.log('Bu site için özel sepet mantığı çalışıyor!');
});
```

> 💡 **Multi-Tenant Kullanımı:** Her tenant kendi `overrideAction` tanımlamalarını yapabilir. Böylece ortak bir çekirdek kod tabanı üzerinde bağımsız site davranışları mümkün olur.

---

## 🚦 Ara Katmanlar (Middleware)

İşlemlerin arasına girmek için kullanılır. `context.cancel = true` yapılarak işlem akışı durdurulabilir.

### `addMiddleware(actionName, position, callback)`

| Parametre    | Tip        | Değerler           | Açıklama                     |
|--------------|------------|--------------------|------------------------------|
| `actionName` | `string`   | —                  | Hedef aksiyonun adı          |
| `position`   | `string`   | `before` / `after` | Çalışma zamanı               |
| `callback`   | `function` | —                  | Ara katman fonksiyonu         |

**`before`** — Aksiyon çalışmadan hemen önce tetiklenir.
```javascript
// Örnek: Stok ve yetki kontrolü
app.addMiddleware('sepeteEkle', 'before', function(ctx) {
    if (!kullaniciyetkisi()) {
        ctx.cancel = true; // ❌ Aksiyonu durdur
        alert('Bu işlem için giriş yapmalısınız.');
    }
});
```

**`after`** — Aksiyon başarıyla tamamlandıktan sonra tetiklenir.
```javascript
// Örnek: Analytics loglama
app.addMiddleware('sepeteEkle', 'after', function(ctx) {
    gtag('event', 'add_to_cart', { item_id: ctx.payload.urunId });
});
```

---

### `group(actionsArray, middlewares)`

Birden fazla aksiyona aynı anda ara katman eklemek için kullanılır.

```javascript
app.group(['sepeteEkle', 'urunSil', 'siparisOnayla'], {
    before: function(ctx) {
        console.log('Oturum kontrol ediliyor...');
        if (!oturumAcik()) ctx.cancel = true;
    },
    after: function(ctx) {
        console.log('İşlem başarıyla tamamlandı.');
    }
});
```

---

## 🎯 Olay Yönlendirici

Her butona ayrı ayrı `click` yazmak zorunda kalmazsınız.

### `bindEvent(eventType, selector, actionName)`

HTML üzerindeki `data-*` niteliklerini otomatik olarak toplar ve `ctx.payload` içine yerleştirir.

| Parametre    | Tip      | Açıklama                              |
|--------------|----------|---------------------------------------|
| `eventType`  | `string` | DOM olay tipi (`click`, `submit`, vb.) |
| `selector`   | `string` | CSS seçici                            |
| `actionName` | `string` | Tetiklenecek aksiyonun adı            |

```javascript
app.bindEvent('click', '.btn-sepete-ekle', 'sepeteEkle');
```

```html
<!-- data-* nitelikleri otomatik olarak ctx.payload'a eklenir -->
<button class="btn-sepete-ekle" data-urun-id="42" data-adet="1">
    Sepete Ekle
</button>
```

> 📋 **Form Desteği:** Bir `submit` olayına bağlandığında, form içindeki tüm input değerlerini otomatik olarak JSON objesine dönüştürür.

```javascript
app.bindEvent('submit', '#siparisFormu', 'siparisGonder');
// ctx.payload → { ad: "...", adres: "...", kart: "..." }
```

---

## 📦 Durum Yönetimi

Modern framework'lerdeki **Reactive** yapıyı jQuery'ye getirir.

### `setState(key, value)`

Bir veriyi güncellediğiniz an, HTML'de `data-liqua-bind="key"` yazan her yer sayfa yenilenmeden **otomatik olarak** değişir.

```javascript
app.setState('sepetSayisi', 5);
// Aşağıdaki HTML elementi anında "5" olarak güncellenir ↓
```

```html
<span data-liqua-bind="sepetSayisi">0</span>
```

> ✨ Herhangi bir DOM manipülasyonu gerekmez. State değiştiğinde bağlı tüm elementler kendiliğinden güncellenir.

---

## 🌐 HTTP Servisi

Dahili bir Ajax istemcisidir. İstek sırasında hedef element üzerinde otomatik olarak `.liqua-loading` class'ı ile yükleme animasyonu yönetebilir.

```javascript
// POST isteği
app.http.post('/api/save', ctx.payload)
    .then(function(response) {
        console.log('Başarılı!', response);
        app.setState('sonDurum', 'kaydedildi');
    })
    .catch(function(error) {
        console.error('Hata:', error);
    });

// GET isteği
app.http.get('/api/urunler')
    .then(function(data) {
        console.log(data);
    });
```

---

## 🧩 Context Objesi

Her aksiyon ve middleware fonksiyonuna otomatik olarak iletilen `ctx` objesi şu alanları içerir:

| Alan              | Tip       | Açıklama                                      |
|-------------------|-----------|-----------------------------------------------|
| `ctx.payload`     | `object`  | HTML `data-*` niteliklerinden veya formdan gelen veriler |
| `ctx.element`     | `jQuery`  | Liqua'nın bağlı olduğu ana kapsayıcı element  |
| `ctx.triggerElement` | `jQuery` | Olayı tetikleyen buton veya form            |
| `ctx.result`      | `any`     | Aksiyonun döndürdüğü sonuç                    |
| `ctx.cancel`      | `boolean` | `true` yapılırsa işlem akışı durdurulur       |

```javascript
app.addAction('urunDetay', function(ctx) {
    console.log(ctx.payload);        // { urunId: "42" }
    console.log(ctx.triggerElement); // Tıklanan buton
    console.log(ctx.element);        // #app
});
```

---

## 💡 Tam Kullanım Örneği

```javascript
const app = $('#app').liqua({ debugMode: true });

// 1. Tüm veri değiştiren işlemlere oturum kontrolü ekle
app.group(['sepeteEkle', 'urunSil', 'favoriyeEkle'], {
    before: function(ctx) {
        if (!window.kullanici) {
            ctx.cancel = true;
            $('#loginModal').show();
        }
    }
});

// 2. Aksiyonu tanımla
app.addAction('sepeteEkle', function(ctx) {
    return app.http.post('/api/sepet', ctx.payload);
});

// 3. Aksiyon bittikten sonra UI'ı güncelle
app.addMiddleware('sepeteEkle', 'after', function(ctx) {
    const yeniSayi = parseInt($('[data-liqua-bind="sepetSayisi"]').text()) + 1;
    app.setState('sepetSayisi', yeniSayi);
});

// 4. HTML'e bağla — artık her .btn-sepete-ekle butonu otomatik çalışır
app.bindEvent('click', '.btn-sepete-ekle', 'sepeteEkle');
```

```html
<div id="app">
    <span>Sepet: <strong data-liqua-bind="sepetSayisi">0</strong></span>

    <button class="btn-sepete-ekle" data-urun-id="101" data-adet="1">
        Sepete Ekle
    </button>
</div>
```

---

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için önce bir issue açarak ne değiştirmek istediğinizi tartışın.

---

## 📄 Lisans

[MIT](LICENSE) © Abdullah Ay
