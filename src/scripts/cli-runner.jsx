// CLI runner for After Effects MCP (Runs headless ExtendScript via AfterFX.exe -r)
(function() {
    try {
        $.global.MCP_HEADLESS = true;
        var runnerFile = new File($.fileName);
        var scriptsDir = runnerFile.parent;
        var bridgeFile = new File(scriptsDir.fsName + "/mcp-bridge-auto.jsx");
        if (bridgeFile.exists) {
            $.evalFile(bridgeFile);
        }
        if (typeof checkForCommands === "function") {
            checkForCommands();
        }
    } catch(e) {
        try {
            var lad = null;
            try { lad = $.getenv("LOCALAPPDATA"); } catch (el) {}
            var basePath = lad ? (lad + "/ae-mcp-bridge") : (Folder.myDocuments.fsName + "/ae-mcp-bridge");
            var resFile = new File(basePath + "/ae_mcp_result.json");
            resFile.open("w");
            resFile.encoding = "UTF-8";
            resFile.write('{"status":"error","error":"CLI Runner exception: ' + e.toString().replace(/"/g, '\\"') + '"}');
            resFile.close();
        } catch(ignored) {}
    }
})();
