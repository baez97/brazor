function showError(message) {
    var errorBox = $('#errorBox');
    errorBox.empty();
    errorBox.append(message);
}

function cleanError() {
    $('#errorBox').empty();
}
