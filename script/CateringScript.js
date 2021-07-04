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
        //최저의 딜로스를 찾아서
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

  resultText += "남은 점수 : {0}<br>".format(targetScore);
  resultText += "<br>계산결과(딜로스) : {0} ({1})<br><br>".format(bestScore, bestDeallose);

  resultText += "---------막타 칠 사람들--------------<br>";
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
  resultText += "---------이 점수의 사람을 찾아보세요!------<br>";
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
      alert('입력 완료.');
    }
  });
}



const getCombinations = function (arr, selectNumber) {
  const results = [];
  if (selectNumber === 1) return arr.map((value) => [value]); // 1개씩 택할 때, 바로 모든 배열의 원소 return

  arr.forEach((fixed, index, origin) => {
    const rest = origin.slice(index + 1); // 해당하는 fixed를 제외한 나머지 뒤
    const combinations = getCombinations(rest, selectNumber - 1); // 나머지에 대해서 조합을 구한다.
    const attached = combinations.map((combination) => [fixed, ...combination]); //  돌아온 조합에 떼 놓은(fixed) 값 붙이기
    results.push(...attached); // 배열 spread syntax 로 모두다 push
  });

  return results; // 결과 담긴 results return
}
