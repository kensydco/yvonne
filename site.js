/* Shared site behavior: nav scroll state, mobile menu, scroll reveals, footer year */
(function(){
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function(){
    var nav = document.querySelector('.nav');
    if(nav && nav.classList.contains('on-dark')){
      var onScroll = function(){ nav.classList.toggle('scrolled', window.scrollY > 24); };
      onScroll(); window.addEventListener('scroll', onScroll, {passive:true});
    }
    // Mobile menu
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.mobile-menu');
    if(toggle && menu){
      toggle.addEventListener('click', function(){
        var open = menu.classList.toggle('open');
        document.body.style.overflow = open ? 'hidden' : '';
      });
      menu.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click', function(){ menu.classList.remove('open'); document.body.style.overflow=''; });
      });
    }
    // Reveals
    var els = document.querySelectorAll('.reveal');
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
      }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
      els.forEach(function(el){ io.observe(el); });
    } else { els.forEach(function(el){ el.classList.add('in'); }); }
    // Year
    document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });
    // FAQ accordion
    document.querySelectorAll('.faq-q').forEach(function(btn){
      btn.addEventListener('click', function(){
        var item = btn.closest('.faq-item');
        var ans = item.querySelector('.faq-a');
        var open = item.classList.toggle('open');
        ans.style.maxHeight = open ? (ans.scrollHeight + 'px') : '0px';
      });
    });
  });
})();
