var selectedStage = 0;
var stageUserCount = 0;
var sheetKey = "1RORlVLWBYT-7tBeR6zw-Ejmsv7v57DU45B1ArMYorsk";

String.prototype.format = function() {
  var theString = this;

    for (var i = 0; i < arguments.length; i++) {
        var regExp = new RegExp('\\{' + i + '\\}', 'gm');
        theString = theString.replace(regExp, arguments[i]);
    }

    return theString;
}

function setStage(){
  $("#stage").append("<option value='-1'>Select</option>");
  for(var i=1; i <=50; i++)
  {
    var option = "<option value='{0}'>{1}</option>".format(i,i);
    $("#stage").append(option);
  }
}


function selectStage(){
  selectedStage = $("#stage option:selected").val();
  stageUserCount = 0;

    $("#stageInfo").show();
    $("#userInfo").empty();
}

function deleteUser(index)
{
  var target = "#userInfo{0}".format(index);
  $(target).remove();
}

function addUserInput(){
    var table = "";

    table += "<tr id='userInfo{0}'>".format(stageUserCount);
    table += "<td><input class='input' id='userName{0}'></td>".format(stageUserCount);
    table += "<td><input class='input' type='number' id='userScore{0}'></td>".format(stageUserCount);
    table += "<td><button type='button' name='button' onclick='deleteUser({0})'>X</button></td>".format(stageUserCount);
    table += "</tr>";

    $("#userInfo").append(table);
    stageUserCount++;
}

function calculate(){
  calTotal();
}

function calTotal()
{
  const m_Scores = new Array();

  var i = 0;
  var count = 0;
  while(count < stageUserCount)
  {
    if($("#userScore"+i).val() != 0)
    {
        m_Scores.push($("#userScore"+i).val());
        count++;
    }
    i++;
  }

  var bestScore = 0;
  var bestDeallose = 10000000;
  var bestArray;
  var planBArraySum = [];
  var stageScore = $("#targetScore").val();
  var nowScore = $("#nowScore").val();
  var targetScore = Number(stageScore) - Number(nowScore);

  for(var j = stageUserCount; j >= 1; j--)
  {
    const result = getCombinations(m_Scores, j);
    var idx = 0;
    while(idx < result.length)
    {
      const sum = result[idx].reduce((a,b) => (Number(a)+Number(b)));
      if(sum - targetScore >= 0 && sum - targetScore < bestDeallose)
      {
        //????????? ???????????? ?????????
        bestScore = sum;
        bestArray = result[idx];
        bestDeallose = sum - targetScore;
      }
      else if(sum - targetScore < -300000 && sum - targetScore > -600000)
      {
        planBArraySum.push(sum - targetScore);
      }

      idx++;
    }
  }

  var resultText = "";

  resultText += "?????? ?????? : {0}<br>".format(targetScore);
  resultText += "<br>????????????(?????????) : {0} ({1})<br><br>".format(bestScore, bestDeallose);

  resultText += "---------?????? ??? ?????????--------------<br>";
  i = 0;
  count = 0;
  while(count < stageUserCount && bestArray.length > 0)
  {
    if($("#userScore"+i).val() != 0)
    {
        var sc = $("#userScore"+i).val();
        var idx = bestArray.indexOf(sc);
        if(idx >= 0)
        {
          resultText += "- {0} ({1})<br>".format($("#userName"+i).val(),sc);
          bestArray.splice(idx, 1);
        }
        count++;
    }
    i++;
  }
  resultText += "-----------------------------<br><br>";
  resultText += "---------??? ????????? ????????? ???????????????!------<br>";
  planBArraySum.sort();
  for(var k =0 ; k < planBArraySum.length; k++)
  {
    resultText += "-{0} <br>".format(planBArraySum[k]);
  }
  resultText += "---------------------------------------<br><br>";

  $("#result").empty();
  $("#result").append(resultText);
}

function SaveStage(){

  var dataStr = "";
  i = 0;
  count = 0;
  dataStr += $("#targetScore").val() + ",";
  dataStr += $("#nowScore").val();

  while(count < stageUserCount)
  {
    if($("#userScore"+i).val() != 0){
      dataStr += "," + $("#userName"+i).val() +","+$("#userScore"+i).val();
      count++;
    }
    i++;
  }
  console.log(dataStr);

  $.ajax({
    type: "POST",
    url: "https://script.google.com/macros/s/AKfycbwDOy7Ap5afNUi55sXceH8r0ye4pHK5HuFzLqzUxrl5Z2Rbcny86WGVItZtScH89Jxs/exec",
    data: {
      "sheet_name":"1",
      "datas":dataStr,
      "stage":selectedStage
    },
    success:function(data){
    console.log(data);
      alert('?????? ??????.');
    }
  });
}



const getCombinations = function (arr, selectNumber) {
  const results = [];
  if (selectNumber === 1) return arr.map((value) => [value]); // 1?????? ?????? ???, ?????? ?????? ????????? ?????? return

  arr.forEach((fixed, index, origin) => {
    const rest = origin.slice(index + 1); // ???????????? fixed??? ????????? ????????? ???
    const combinations = getCombinations(rest, selectNumber - 1); // ???????????? ????????? ????????? ?????????.
    const attached = combinations.map((combination) => [fixed, ...combination]); //  ????????? ????????? ??? ??????(fixed) ??? ?????????
    results.push(...attached); // ?????? spread syntax ??? ????????? push
  });

  return results; // ?????? ?????? results return
}
