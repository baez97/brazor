function showError(message) {
    var errorBox = $('#errorBox');
    errorBox.append(message);
}

function cleanError() {
    $('#errorBox').empty();
}

module.exports.showError = showError;
