/**
 * myFunctions.js — مطعم الأصدقاء
 * ملف JavaScript موحد لجميع الصفحات
 */

/* ============================================================
   jQuery — عند تحميل الصفحة
   ============================================================ */
$(document).ready(function () {

    /* ===== Hamburger Menu ===== */
    $('#hamburger').on('click', function () {
        $(this).toggleClass('open');
        $('#navLinks').toggleClass('open');
    });

    // إغلاق القائمة عند الضغط على رابط
    $('#navLinks a').on('click', function () {
        $('#hamburger').removeClass('open');
        $('#navLinks').removeClass('open');
    });

    // إغلاق القائمة عند الضغط خارجها
    $(document).on('click', function (e) {
        if (!$(e.target).closest('header').length) {
            $('#hamburger').removeClass('open');
            $('#navLinks').removeClass('open');
        }
    });

    /* ===== تأثير ظهور ===== */
    $('.fade-in').css({ opacity: 0 }).each(function (i) {
        var el = $(this);
        setTimeout(function () { el.css({ opacity: 1 }); }, i * 100);
    });

    /* ===== إغلاق النافذة عند الضغط خارجها ===== */
    $('#resultModal').on('click', function (e) {
        if ($(e.target).is('#resultModal')) closeModal();
    });

    /* ===== التحقق الفوري عند الكتابة ===== */
    $('#fullName').on('input', function () {
        var v = $(this).val();
        if (!v.trim()) { $(this).removeClass('error valid'); $('#err-fullName').removeClass('show'); }
        else setFieldState('fullName', validateName(v), 'err-fullName');
    });

    $('#nationalId').on('input', function () {
        $(this).val($(this).val().replace(/\D/g, ''));
        var v = $(this).val();
        if (v) setFieldState('nationalId', validateNationalId(v), 'err-nationalId');
        else   { $(this).removeClass('error valid'); $('#err-nationalId').removeClass('show'); }
    });

    $('#birthDate').on('change', function () {
        var v = $(this).val();
        if (v) setFieldState('birthDate', validateBirthDate(v), 'err-birthDate');
    });

    $('#mobile').on('input', function () {
        $(this).val($(this).val().replace(/\D/g, ''));
        var v = $(this).val();
        if (v) setFieldState('mobile', validateMobile(v), 'err-mobile');
        else   { $(this).removeClass('error valid'); $('#err-mobile').removeClass('show'); }
    });

    $('#email').on('input', function () {
        var v = $(this).val();
        if (v) setFieldState('email', validateEmail(v), 'err-email');
        else   { $(this).removeClass('error valid'); $('#err-email').removeClass('show'); }
    });

    /* ===== Checkbox إظهار التفاصيل ===== */
    $(document).on('change', '.detail-check', function () {
        var id  = $(this).data('id');
        var row = $('#detail-' + id);
        if ($(this).is(':checked')) {
            row.fadeIn(200);
        } else {
            row.fadeOut(200);
        }
    });

});

/* ============================================================
   وظائف الوجبات
   ============================================================ */

function showOrderForm() {
    if ($('.meal-check:checked').length === 0) {
        alert('يرجى اختيار وجبة واحدة على الأقل قبل المتابعة!');
        return;
    }
    $('#orderForm').slideDown(400);
    $('html, body').animate({ scrollTop: $('#orderForm').offset().top - 20 }, 500);
}

function cancelOrder() {
    $('#orderForm').slideUp(300);
    resetForm();
}

/* ============================================================
   التحقق من المدخلات
   ============================================================ */

function validateName(val) {
    if (!val.trim()) return true;
    return /^[\u0600-\u06FF\s]+$/.test(val.trim());
}

function validateNationalId(val) {
    if (!/^\d{11}$/.test(val)) return false;
    var prefix = parseInt(val.substring(0, 2));
    return prefix >= 1 && prefix <= 14;
}

function validateBirthDate(val) {
    if (!val) return true;
    var d = new Date(val);
    return !isNaN(d.getTime()) && d < new Date();
}

function validateMobile(val) {
    if (!val.trim()) return true;
    // Syriatel: 093, 094, 095 / MTN: 096, 098, 099, 011
    return /^(093|094|095|096|098|099)\d{7}$/.test(val) ||
           /^011\d{7}$/.test(val);
}

function validateEmail(val) {
    if (!val.trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function setFieldState(inputId, isValid, errId) {
    $('#' + inputId).removeClass('error valid').addClass(isValid ? 'valid' : 'error');
    isValid ? $('#' + errId).removeClass('show') : $('#' + errId).addClass('show');
    return isValid;
}

/* ============================================================
   إرسال الطلب
   ============================================================ */

function submitOrder() {
    var ok = true;

    var nameVal   = $('#fullName').val();
    var idVal     = $('#nationalId').val();
    var birthVal  = $('#birthDate').val();
    var mobileVal = $('#mobile').val();
    var emailVal  = $('#email').val();

    if (!validateName(nameVal))       { setFieldState('fullName',   false, 'err-fullName');   ok = false; }
    else                              { setFieldState('fullName',   true,  'err-fullName'); }

    if (!validateNationalId(idVal))   { setFieldState('nationalId', false, 'err-nationalId'); ok = false; }
    else                              { setFieldState('nationalId', true,  'err-nationalId'); }

    if (birthVal && !validateBirthDate(birthVal)) { setFieldState('birthDate', false, 'err-birthDate'); ok = false; }
    else if (birthVal)                { setFieldState('birthDate', true, 'err-birthDate'); }

    if (mobileVal && !validateMobile(mobileVal))  { setFieldState('mobile', false, 'err-mobile'); ok = false; }
    else if (mobileVal)               { setFieldState('mobile', true, 'err-mobile'); }

    if (emailVal && !validateEmail(emailVal))      { setFieldState('email', false, 'err-email'); ok = false; }
    else if (emailVal)                { setFieldState('email', true, 'err-email'); }

    if (!ok) {
        $('html,body').animate({ scrollTop: $('#orderForm').offset().top - 20 }, 300);
        return;
    }

    // جمع الوجبات المختارة
    var meals = [];
    var total = 0;

    $('.meal-check:checked').each(function () {
        var price = parseInt($(this).data('price'));
        meals.push({
            id:    $(this).data('id'),
            name:  $(this).data('name'),
            price: price
        });
        total += price;
    });

    var tax      = total * 0.05;
    var netTotal = total - tax;

    // بناء محتوى النافذة
    var html = '<div class="modal-item"><h4>👤 معلومات مقدم الطلب</h4>';
    if (nameVal)   html += '<p>الاسم: '          + nameVal   + '</p>';
    html +=                '<p>الرقم الوطني: '   + idVal     + '</p>';
    if (birthVal)  html += '<p>تاريخ الميلاد: '  + birthVal  + '</p>';
    if (mobileVal) html += '<p>الموبايل: '        + mobileVal + '</p>';
    if (emailVal)  html += '<p>البريد: '          + emailVal  + '</p>';
    html += '</div>';

    html += '<h4 style="margin:1rem 0 .5rem;color:var(--primary)">🍽️ الوجبات المطلوبة:</h4>';
    $.each(meals, function (i, m) {
        html += '<div class="modal-item">'
              + '<h4>' + m.id + ' — ' + m.name + '</h4>'
              + '<p>السعر: ' + fmt(m.price) + ' ل.س</p>'
              + '</div>';
    });

    html += '<div class="modal-total">'
          + '<p>المجموع قبل الضريبة: ' + fmt(total) + ' ل.س</p>'
          + '<p>ضريبة (5%): &nbsp; – ' + fmt(Math.round(tax)) + ' ل.س</p>'
          + '<hr style="border-color:rgba(255,255,255,.25);margin:.5rem 0">'
          + '<p style="font-size:1.15rem;font-weight:bold">المبلغ النهائي: '
          + fmt(Math.round(netTotal)) + ' ل.س</p>'
          + '</div>';

    $('#modalContent').html(html);
    $('#resultModal').addClass('show');
}

function fmt(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function closeModal() {
    $('#resultModal').removeClass('show');
}

function resetForm() {
    $('#fullName,#nationalId,#birthDate,#mobile,#email').val('');
    $('input[type="text"],input[type="email"],input[type="date"]').removeClass('error valid');
    $('.error-msg').removeClass('show');
}

/* تمرير سلس */
function scrollToSection(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
