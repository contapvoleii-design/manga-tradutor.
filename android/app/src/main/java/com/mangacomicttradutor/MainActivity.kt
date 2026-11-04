package com.mangacomicttradutor

import android.app.Activity
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.EditText
import android.widget.Toast

class MainActivity : Activity() {
    private lateinit var web: WebView
    private lateinit var address: EditText

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        address = findViewById(R.id.urlInput)
        web = findViewById(R.id.mangaWebView)
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.loadsImagesAutomatically = true
        web.settings.useWideViewPort = true
        web.settings.loadWithOverviewMode = true
        web.webChromeClient = WebChromeClient()
        web.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView, url: String) {
                address.setText(url)
                injectTranslationHelper()
            }
        }
        findViewById<Button>(R.id.openButton).setOnClickListener { openUrl(address.text.toString()) }
    }

    private fun openUrl(value: String) {
        var url = value.trim()
        if (url.isEmpty()) return
        if (!url.startsWith("https://") && !url.startsWith("http://")) url = "https://$url"
        if (!url.startsWith("https://")) {
            Toast.makeText(this, "Use um endereço HTTPS seguro.", Toast.LENGTH_LONG).show()
            return
        }
        web.loadUrl(url)
    }

    // Adiciona o controle do Google Tradutor ao conteúdo quando o site permite scripts externos.
    private fun injectTranslationHelper() {
        val script = """
          (function(){
            if(document.getElementById('mct-translate-widget')) return;
            var box=document.createElement('div');
            box.id='mct-translate-widget';
            box.style='position:fixed;z-index:2147483647;top:8px;left:8px;background:#fff;padding:6px;border:1px solid #ddd;border-radius:8px;box-shadow:0 2px 8px #0003';
            box.innerHTML='<div id="google_translate_element"></div>';
            document.body.appendChild(box);
            window.googleTranslateElementInit=function(){
              new google.translate.TranslateElement({pageLanguage:'auto',includedLanguages:'pt',autoDisplay:false},'google_translate_element');
            };
            var s=document.createElement('script');
            s.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            s.onerror=function(){box.innerText='Tradução indisponível neste site';};
            document.head.appendChild(s);
          })();
        """.trimIndent()
        web.evaluateJavascript(script, null)
    }

    override fun onBackPressed() {
        if (this::web.isInitialized && web.canGoBack()) web.goBack() else super.onBackPressed()
    }
}
