import webview
import os

QEFilename = "2026_QE_APR.txt"
handicapFilename = "2026.txt"

class API:
    def setTitle(self,title):
        window.title = title

    def QES(self):
        QEs = []
        QElines = open(QEFilename,"r").readlines()
        for e,l in enumerate(QElines):
            #RH400SB,Richard Hargreaves,Sarah Binstead,RS 400,1101,977,S,G
            tokens = l.split(",")
            if len(tokens) == 8:
                QEs.append({"QE":tokens[0],"Helm":tokens[1],"Crew":tokens[2],"boatClass":tokens[3],"Personal":int(tokens[5])});
            else:
                print(f"badQE: {e}, {l}")
        return QEs
    
    def handicaps(self): 
        handicapLines = open(handicapFilename,"r").readlines()
        handicaps = []
        for e,l in enumerate(handicapLines):
            tokens = l.split(",")
            if len(tokens) == 8:
                handicaps.append({"boatClass":tokens[0],"PY":int(tokens[1])})
            else:
                print(f"badHandicap: {e}, {l}")
        return handicaps

    def saveRaceFile(self,filename,topSection):
        t = topSection.strip("\n")
        h = open(handicapFilename,"r").read().strip("\n")
        q = open(QEFilename,"r").read().strip("\n")
        open(filename,"w").write(t + "\n<HANDICAPS>\n" + h + "\n<QES>\n" + q)
        
    
api = API()
html = os.path.join(os.path.dirname(__file__), "gui.html")

window = webview.create_window(
    "Race Manager",
    url=html,
    js_api=api,
    width=1300,
    height=800
)

webview.start(
    debug=False
)