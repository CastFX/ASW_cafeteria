exports.needleman_wunsch = function(s1, s2) {
    var sp = 1;
    var gp = -1;
    var gc = "-";

    var arr = Array(s2.length + 1).fill().map(()=>Array(s1.length + 1).fill());



    arr[0][0] = 0;

    for(var i=1;i<=s2.length;i++) {
        arr[i][0] = -1 * i;
    }
    for(var i=1;i<=s1.length;i++) {
        arr[0][i] = -1 * i;
    }
    

    for(var i=1;i<=s2.length;i++) {
        for(var j=1;j<=s1.length;j++) {
            arr[i][j] = Math.max(
                arr[i-1][j-1] + (s2[i-1] === s1[j-1] ? sp : gp),
                arr[i-1][j] + gp,
                arr[i][j-1] + gp
            );
        }
    }

    var as1 = "";
    var as2 = "";

    var i = s2.length;
    var j = s1.length;

    do {
        var t = arr[i-1][j];
        var d = arr[i-1][j-1];
        var l = arr[i][j-1];
        var max = Math.max(t, d, l);

        switch(max) {
            case t:
                i--;
                as1 += gc;
                as2 +=s2[i];
                break;
            case d:
                j--;
                i--;
                as1 += s1[j];
                as2 += s2[i];
                break;
            case l:
                j--;
                as1 += s1[j];
                as2 += gc;
                break;
        }

    } while(i>0 && j>0);

    as1 = as1.split("").reverse().join("");
    as2 = as2.split("").reverse().join("");

    return {"s1": s1, "s2": s2, "as1": as1, "as2": as2}
}