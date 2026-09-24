package com.chessbuzz.app

import android.app.Activity
import android.os.Bundle
import android.graphics.Color
import android.view.Gravity
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.TextView

class MainActivity : Activity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        try {
            webView = WebView(this)

            webView.setBackgroundColor(Color.rgb(16, 19, 24))

            webView.settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                databaseEnabled = true
                mediaPlaybackRequiresUserGesture = false
            }

            webView.webViewClient = object : WebViewClient() {

                override fun onReceivedError(
                    view: WebView,
                    request: WebResourceRequest,
                    error: WebResourceError
                ) {
                    if (request.isForMainFrame) {
                        showError(
                            "WebView error\n\n${error.description}"
                        )
                    }
                }
            }

            webView.webChromeClient = WebChromeClient()

            setContentView(webView)

            webView.loadUrl("file:///android_asset/index.html")

        } catch (e: Throwable) {
            showError(
                "ChessBuzz startup error\n\n" +
                "${e.javaClass.simpleName}\n\n" +
                "${e.message ?: "Unknown error"}"
            )
        }
    }

    private fun showError(message: String) {
        val errorView = TextView(this)

        errorView.text = message
        errorView.textSize = 16f
        errorView.setTextColor(Color.WHITE)
        errorView.setBackgroundColor(Color.rgb(16, 19, 24))
        errorView.gravity = Gravity.CENTER
        errorView.setPadding(40, 40, 40, 40)

        setContentView(errorView)
    }

    override fun onDestroy() {
        if (::webView.isInitialized) {
            webView.stopLoading()
            webView.destroy()
        }

        super.onDestroy()
    }
}
