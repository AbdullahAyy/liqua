# 🌊 Liqua Framework

Liqua, jQuery tabanlı projeleriniz için geliştirilmiş, **multi-tenant** (çoklu site) yapısına uygun, modern ve esnek bir geliştirme çatısıdır. 50 farklı siteyi tek bir merkezden yönetirken her siteye özel dokunuşlar yapmanıza olanak tanır.

## 🚀 Öne Çıkan Özellikler
- **Event Router:** HTML elementlerini ve form verilerini otomatik olarak aksiyonlara bağlar.
- **Middleware (Ara Katman):** Aksiyonların başına veya sonuna kanca (hook) atmanızı sağlar.
- **State Management:** Veri değiştiğinde HTML içeriğini anında günceller.
- **HTTP Wrapper:** Yüklenme (loading) animasyonu destekli gelişmiş AJAX servisi.
- **Action Overriding:** Çekirdek kodu bozmadan her siteye özel fonksiyonlar tanımlama.

## 📦 Kurulum (CDN)

Liqua'yı projenize eklemek için aşağıdaki satırları HTML dosyanıza (jQuery'den sonra) eklemeniz yeterlidir:

```html
<script src="[https://code.jquery.com/jquery-3.6.0.min.js](https://code.jquery.com/jquery-3.6.0.min.js)"></script>
<script src="[https://cdn.jsdelivr.net/gh/KULLANICI_ADIN/liqua@v1.0.0/dist/liqua.min.js](https://cdn.jsdelivr.net/gh/KULLANICI_ADIN/liqua@v1.0.0/dist/liqua.min.js)"></script>
