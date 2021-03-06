/**
 * a class to view and control account recovery (password forgetting) prcess
 * 
 */

function AccountRecoveryControl() {
    'use strict';
    this.$recoveryPageContainer = $('.main-mid-pad.backup-recover.improved-recovery-steps');
    this.$leftSide = $('.main-left-block', this.$recoveryPageContainer);
    this.$leftContent = $('.content-wrapper', this.$leftSide);
    this.$rightSide = $('.main-right-block.recover-block.decision-breadcrumb', this.$recoveryPageContainer);
    this.$rightContent = $('.content-wrapper', this.$rightSide);
    this.currStep = 0;
    this.currBranch = 0;
    this.checks = 0;
    this.checks2 = 0;
    var self = this;

    $('.app-button-block .app-button', this.$leftContent).rebind('click', function () {
        self.prepareInstruction(this.classList[this.classList.length - 1]);
    });
    $('.content-highlight-block', this.$leftContent).rebind('click', function () {
        //loadSubPage('help');
        window.open("https://mega.nz/help");
    });

    $('.progress-points .progress-point', this.$rightContent).rebind('click', function () {
        if ($(this).hasClass('step1')) {
            self.showStep(1);
        }
        else if ($(this).hasClass('step2')) {
            self.showStep(2);
        }
        else if ($(this).hasClass('step3')) {
            var answerClue = $('.step-answer', this).text();
            if (answerClue.indexOf('Recovery Key') > -1) {
                self.showStep(3);
            }
            else {
                self.showStep(3, 1);
            }
        }
        else if ($(this).hasClass('step4')) {
            self.showStep(4);
        }
        else if ($(this).hasClass('warning')) {
            self.showStep(-1);
        }
        else if ($(this).hasClass('success')) {
            self.showStep(-2);
        }
    });

    $('.button-container .recover-button', this.$leftContent).rebind('click', function () {
        $('.progress-point.step' + self.currStep + ' .step-answer', self.$rightContent)
            .text($(this).text());
        switch (self.currStep) {
            case 1: {
                if ($(this).hasClass('yes')) {
                    self.showStep(-2); // success
                }
                else {
                    self.showStep(2);
                }
                break;
            }
            case 2: {
                if ($(this).hasClass('yes')) {
                    self.showStep(3, 1);
                }
                else {
                    self.showStep(3);
                }
                break;
            }
            case 3: {
                if (!self.currBranch) {
                    if ($(this).hasClass('yes')) {
                        self.showStep(-2, 1); // success
                    }
                    else {
                        self.showStep(-1); // -1 for warning
                    }
                }
                else {
                    if ($(this).hasClass('yes')) {
                        self.showStep(-2); // success
                    }
                    else {
                        self.showStep(4);
                    }
                }
                break;
            }
            case 4: {
                if ($(this).hasClass('yes')) {
                    self.showStep(-2, 1); // success
                }
                else {
                    self.showStep(-1); // -1 for warning
                }
                break;
            }
            case -1: {
                if ($(this).hasClass('yes')) {
                    self.showStep(1);
                }
                else {
                    self.showParkWarning();
                }
                break;
            }
            case -2: {
                var email = $('.login-register-input.email input', self.$leftContent).val();
                self.startRecovery(email); // recover
                break;
            }
        }
    });

    $('.checkbox-container .settings-row', this.$leftContent).rebind('click', function () {
        var checkB = $('.checkdiv', this);
        if (checkB.hasClass('checkboxOn')) {
            checkB.removeClass('checkboxOn');
            $('.checkbox', checkB).removeClass('checkboxOn');
            checkB.addClass('checkboxOff');
            $('.checkbox', checkB).addClass('checkboxOff');
            self.checks--;
            $('.button-container', self.$leftContent).addClass('hidden');
        }
        else {
            checkB.addClass('checkboxOn');
            $('.checkbox', checkB).addClass('checkboxOn');
            checkB.removeClass('checkboxOff');
            $('.checkbox', checkB).removeClass('checkboxOff');
            if (++self.checks === 2) {
                $('.button-container', self.$leftContent).removeClass('hidden');

            }
        }
    });
}

/**
 * a controller function to view the step, start from step =1
 * @param {Number} step : the step number [default=1]
 * @param {Number} branch : to distinguish steps with multiple branches
 */
AccountRecoveryControl.prototype.showStep = function _showStep(step, branch) {
    'use strict';
    if (!step) {
        step = 1;
    }
    this.currStep = step;
    if (!branch) {
        branch = 0;
    }
    this.currBranch = branch;
    var question1 = escapeHTML(l[18254]); // 'Are you logged into your account on another internet browser?';
    var desc1 = escapeHTML(l[18255]);
        /* 'Please check your browser (Chrome, Firefox, Opera, Edge , IE ... etc) to see '
        + 'if you are still logged into your account. you might have also logged into MEGA on someone else computer.';
        */
    var stepNb = escapeHTML(l[18256]).replace('{NB}', '1'); // 'Step 1';
    var checkBx1 = escapeHTML(l[18257]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
    // 'I have checked internet browsers on my computer for logged in accounts.';
    var checkBx2 = escapeHTML(l[18258]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
    // 'I have checked internet browsers on other computer for logged in accounts.';
    var yesAnswer = l[18259]; //'Yes, I am logged into my account on another browser';
    var noAnswer = l[18260]; // 'No, I am not logged into my account on another browser';
    if (step === 2) {
        question1 = escapeHTML(l[18261]); // 'Do you have the MEGA app installed on your phone, tablet or desktop?';
        desc1 = escapeHTML(l[18262]);
        // 'Check to see if you have the MEGA app installed on your mobile device or your computer.';
        stepNb = escapeHTML(l[18256]).replace('{NB}', '2'); // 'Step 2';
        checkBx1 = escapeHTML(l[18263]); // 'I have checked my phone and/or tablet for the MEGA app';
        checkBx2 = escapeHTML(l[18264]); // 'I have checked my computer and/or laptop for the desktop app';
        yesAnswer = l[18265]; // 'Yes, I have the MEGA app installed';
        noAnswer = l[18266]; // 'No, I do not have the MEGA app installed';
    }
    else if ((step === 3 || step === 4) && !branch) {
        question1 = escapeHTML(l[1937]); // 'Do you have a back up of your Recovery Key?';
        desc1 = escapeHTML(l[18268]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
            /* 'If you have a backup of your master crypto key you can reset your password by selecting YES.'
            + '<br/> <br/>'
            + 'If you dont have you can no longer decrypt your existing accout, but you can start a new one'
            + ' under the same email address by selecing NO.';
            */
        stepNb = escapeHTML(l[18256]).replace('{NB}', step); // 'Step 3 or 4';
        checkBx1 = '';
        checkBx2 = '';
        yesAnswer = l[18269]; // 'Yes, I have my Recovery Key';
        noAnswer = l[18270]; // 'No, I do not have my Recovery Key';
    }
    else if (step === 3 && branch === 1) {
        question1 = escapeHTML(l[18271]);
        // 'Are you logged into the MEGA app installed on your phone, tablet or desktop?';
        desc1 = escapeHTML(l[18272]);
        // 'Can you access your account on the MEGA app. If you can, you can change your password.';
        stepNb = escapeHTML(l[18256]).replace('{NB}', '3'); // 'Step 3';
        checkBx1 = escapeHTML(l[18273]); // 'I have checked to see if I am logged in on my phone and/or tablet';
        checkBx2 = escapeHTML(l[18274]); // 'I have checked to see of I am logged in on my desktop and/or laptop';
        yesAnswer = l[18275]; // 'Yes, I am logged into my MEGA app';
        noAnswer = l[18276]; // 'No, I am not logged into my MEGA app';
    }
    else if (step === -1) {
        question1 = escapeHTML(l[8990]);
        /* 'Due to our end-to-end encryption paradigm, you will not be able to '
            + 'access your data without either your password or a backup of your Recovery Key.';
            */
        desc1 = escapeHTML(l[18277]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>')
            .replace(/\[br\/\]/g, '<br/>').replace(/\[br\]/g, '<br/>')
            .replace(/\[B2\]/g, '<span>').replace(/\[\/B2\]/g, '</span>');
            /* 'You can park your exising account and start a fresh one under the same the same e-mail address.'
            + '<br/>In the event that you recall your parked account password, please contact '
            + 'support@mega.nz for recovery assistance.Your data will be retained for at least 60 days.<br/>'
            + 'We recommend you check again to see if you have an active session(logged in) '
            + 'or proceed with parking your account.'
            + '<span>This will delete all your files, contacts and messages.</span>';
            */
        stepNb = escapeHTML(l[882]); // 'Warning';
        checkBx1 = '';
        checkBx2 = '';
        yesAnswer = l[18278]; // 'Check to see if I have an active/logged-in session';
        noAnswer = l[18279]; // 'No, I want to park my account';
    }
    else if (step === -2 && !branch) {
        question1 = l[18281];
        desc1 = '';
        stepNb = l[18280]; // 'Success';
        checkBx1 = '';
        checkBx2 = '';
        yesAnswer = '';
        noAnswer = '';
        this.prepareInstruction();
    }
    else if (step === -2 && branch === 1) {
        question1 = escapeHTML(l[18281]); // 'You can easily change your password. Follow the steps below to see how';
        desc1 = escapeHTML(l[1939]);
            /* 'Please enter your e-mail address below. You will receive a recovery link that will '
            + 'allow you to submit your Recovery Key and reset your password.';
            */
        stepNb = escapeHTML(l[18280]); // 'Success';
        checkBx1 = '';
        checkBx2 = '';
        yesAnswer = l[1940]; // 'Send';
        noAnswer = '';
    }
    //if (stepNb) {
    $('h3.main-italic-header', this.$leftContent).removeClass('hidden')
        .removeClass('warning').removeClass('success');
    $('.warning-icon + h3.main-italic-header', this.$leftContent).text(stepNb);
    //}
    //else {
    //    $('h3.main-italic-header', this.$leftContent).addClass('hidden');
    //}
    if (step === -2) {
        $('h3.main-italic-header', this.$leftContent).addClass('hidden');
        $('h3.main-italic-header.main-header', this.$leftContent).removeClass('hidden');
        $('h3.main-italic-header.main-header', this.$leftContent).addClass('success');
    }
    $('.warning-icon', this.$leftContent).removeClass('warning');
    if (step === -1) {
        $('h3.main-italic-header', this.$leftContent).addClass('warning');
        $('.warning-icon', this.$leftContent).addClass('warning');
    }
    if (question1) {
        $('h1.step-main-question', this.$leftContent).text(question1).removeClass('hidden');
    }
    else {
        $('h1.step-main-question', this.$leftContent).addClass('hidden');
    }

    if (desc1) {
        $('.recover-account-body-text', this.$leftContent).html(desc1).removeClass('hidden');
    }
    else {
        $('.recover-account-body-text', this.$leftContent).addClass('hidden');
    }

    $('.app-instruction-block', this.$leftContent).addClass('hidden');
    $('.recover-account-email-block', this.$leftContent).addClass('hidden');
    $('.button-container .button-aligner.no', this.$leftContent).removeClass('hidden');

    if (checkBx1 && checkBx2) {
        $('.checkbox-block label.radio-txt', this.$leftContent).eq(0).html(checkBx1);
        $('.checkbox-block label.radio-txt', this.$leftContent).eq(1).html(checkBx2);
        $('.checkdiv', this.$leftContent).removeClass('checkboxOn').addClass('checkboxOff');
        $('.checkdiv .checkbox', this.$leftContent).removeClass('checkboxOn').addClass('checkboxOff');
        this.checks = 0;
        $('.checkbox-block ', this.$leftContent).removeClass('hidden');

        $('.button-container', this.$leftContent).addClass('hidden');
    }
    else {
        $('.checkbox-block ', this.$leftContent).addClass('hidden');
        if (yesAnswer || noAnswer) {
            $('.button-container', this.$leftContent).removeClass('hidden');
            if (!noAnswer) {
                $('.button-container .button-aligner.no', this.$leftContent).addClass('hidden');
            }
        }
        else {
            $('.button-container', this.$leftContent).addClass('hidden');
        }
    }

    $('.content-highlight-block', this.$leftContent).addClass('hidden');


    $('.button-container .recover-button.yes', this.$leftContent).text(yesAnswer);
    $('.button-container .recover-button.no', this.$leftContent).text(noAnswer);
    if (step >= 1) {
        $('.progress-point', this.$rightContent).addClass('hidden');
        for (var points = 1; points <= step; points++) {
            $('.progress-point.step' + points, this.$rightContent).removeClass('hidden');
        }
        //$('.progress-point.step1', this.$rightContent).removeClass('hidden');
        $('.progress-point.step' + step + ' .step-label', this.$rightContent).text(stepNb);
        $('.progress-point.step' + step + ' .step-answer', this.$rightContent).text('');

        $('.progress-point.inactive', this.$rightContent).removeClass('hidden');
        $('.progress-point.warning', this.$rightContent).addClass('hidden');
        $('.progress-point.success', this.$rightContent).addClass('hidden');
    }
    else {
        $('.progress-point.inactive', this.$rightContent).addClass('hidden');
        if (step === -1) {
            $('.progress-point.warning', this.$rightContent).removeClass('hidden');
        }
        else {
            $('.progress-point.success', this.$rightContent).removeClass('hidden');
            if (!branch) {
                $('.app-instruction-block', this.$leftContent).removeClass('hidden');
                $('.content-highlight-block', this.$leftContent).removeClass('hidden');
            }
            else {
                $('.recover-account-email-block', this.$leftContent).removeClass('hidden');
            }
        }
    }
};


/**
 * a function to prepare instruction slide
 * @param {String} device : device class, default = android
 */
AccountRecoveryControl.prototype.prepareInstruction = function _prepareInstruction(device) {
    'use strict';
    if (!device) {
        device = 'web';
    }
    $('.app-button-block .app-button', this.$leftContent).removeClass('active');
    $('.app-button-block .app-button.' + device, this.$leftContent).addClass('active');
    var instructions = '';
    if (device === 'web') {
        instructions = '<li class="list-point">';
        instructions += escapeHTML(l[18282]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18283]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18284]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li> <li class="list-point" >';
        instructions += escapeHTML(l[18285]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li>';
    }
    else if (device === 'android') {
        instructions = '<li class="list-point">';
        instructions += escapeHTML(l[18286]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18287]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18288]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li> <li class="list-point" >';
        instructions += escapeHTML(l[18289]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18290]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li>';
    }
    else if (device === 'ios') {
        instructions = '<li class="list-point">';
        instructions += escapeHTML(l[18291]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18292]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18293]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li> <li class="list-point" >';
        instructions += escapeHTML(l[18294]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18295]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li>';
    }
    //else if (device === 'osxmegasync') {
    //}
    else if (device === 'windowsmegasync') {
        instructions = '<li class="list-point">';
        instructions += escapeHTML(l[18301]).replace(/\[B\]/g, '<b class="megasync-logo">')
            //.replace(/\[\/B\]/g, '</b>').replace(/\[LOGO\]/g, '<span class="logo"/>');
            .replace(/\[\/B\]/g, '</b>').replace(/\(M\)/g, '')
            .replace(/\[LOGO\]/g, '');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18302]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18303]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li> <li class="list-point" >';
        instructions += escapeHTML(l[18304]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18305]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18419]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li>';
    }
    else if (device === 'windowsapp') {
        instructions = '<li class="list-point">';
        instructions += escapeHTML(l[18286]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18314]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18315]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li> <li class="list-point" >';
        instructions += escapeHTML(l[18298]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li> <li class="list-point" >';
        instructions += escapeHTML(l[18316]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li>';
    }
    else if (device === 'uwpapp') {
        instructions = '<li class="list-point">';
        instructions += escapeHTML(l[18286]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18296]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18297]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li> <li class="list-point" >';
        instructions += escapeHTML(l[18298]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li><li class="list-point" >';
        instructions += escapeHTML(l[18295]).replace(/\[B\]/g, '<b>').replace(/\[\/B\]/g, '</b>');
        instructions += '</li>';
    }
    $('.app-instructions-list', this.$leftContent).html(instructions);
};

/**
 * function to start recovery process
 * @param {String} email : email for the process
 * @param {Boolean} isPark : optional to indicate if the operation is PARK
 */
AccountRecoveryControl.prototype.startRecovery = function _startRecovery(email, isPark) {
    var t;
    //var email = $('.login-register-input.email input', this.$leftContent).val();

    // Park account
    if (isPark) {
        t = 10;
    }

    // Recover account using backup master key
    else {
        t = 9;
    }

    if (checkMail(email)) {
        msgDialog('warninga', l[1100], l[1101]);
    } else {
        loadingDialog.show();
        api_req({ a: 'erm', m: email, t: t }, {
            callback: function (res) {
                loadingDialog.hide();
                if (res === ENOENT) {
                    msgDialog('warningb', l[1513], l[1946]);
                } else if (res === 0) {
                    handleResetSuccessDialogs('.reset-success', l[735], 'resetsuccess');
                } else {
                    msgDialog('warningb', l[135], l[200]);
                }
            }
        });
    }
};

AccountRecoveryControl.prototype.showParkWarning = function _showParkWarning() {
    var $dialog = $('.fm-dialog.park-account-dialog');
    var self = this;
    self.checks2 = 0;
    $('.checkbox-block.park-account-checkbox .settings-row .checkdiv', $dialog)
        .removeClass('checkboxOn').addClass('checkboxOff');
    $('.checkbox-block.park-account-checkbox .settings-row .checkdiv .checkbox', $dialog)
        .removeClass('checkboxOn').addClass('checkboxOff');
    $('.parkbtn', $dialog).addClass('disabled');
    $('.login-register-input.email input', $dialog).val('');
    var warn2 = escapeHTML(l[18311]).replace(/\[B1\]/g, '<strong class="warning-text">')
        .replace(/\[\/B1\]/g, '</strong>');
    var warn1 = escapeHTML(l[18312]).replace(/\[B1\]/g, '<strong class="warning-text">')
        .replace(/\[\/B1\]/g, '</strong>');
    $('#warn2-check', $dialog).html(warn2);
    $('#warn1-check', $dialog).html(warn1);

    var closeDialogLocal = function _closeDialog() {
        if (is_mobile) {
            $('.mobile.fm-dialog-container').addClass('hidden');
            fm_hideoverlay();
        }
        else {
            $(document).unbind('keydown.parkwarn');
            closeDialog();
        }
    };

    $('.checkbox-block.park-account-checkbox .settings-row', $dialog).rebind('click', function () {
        var checkB = $('.checkdiv', this);
        if (checkB.hasClass('checkboxOn')) {
            checkB.removeClass('checkboxOn');
            $('.checkbox', checkB).removeClass('checkboxOn');
            checkB.addClass('checkboxOff');
            $('.checkbox', checkB).addClass('checkboxOff');
            self.checks2--;
            $('.parkbtn', $dialog).addClass('disabled');
        }
        else {
            checkB.addClass('checkboxOn');
            $('.checkbox', checkB).addClass('checkboxOn');
            checkB.removeClass('checkboxOff');
            $('.checkbox', checkB).removeClass('checkboxOff');
            if (++self.checks2 === 3) {
                $('.parkbtn', $dialog).removeClass('disabled');

            }
        }
    });
    $('.parkbtn', $dialog).rebind('click', function () {
        if ($(this).hasClass('disabled')) {
            return;
        }
        var email = $('.login-register-input.email input', $dialog).val();
        closeDialogLocal();
        self.startRecovery(email, true);
    });

    $('.closebtn, .fm-dialog-close', $dialog).rebind('click', closeDialogLocal);
    if (!is_mobile) {
        $(document).rebind('keydown.parkwarn', function (e) {
            if (e.keyCode === 27) {
                closeDialogLocal();
            }
        });
        $('.login-register-input.email input', $dialog).rebind('keydown.parkwarn', function (e) {
            if (e.keyCode === 13) {
                $('.parkbtn', $dialog).click();
            }
        });
    }
    $('.supportbtn', $dialog).rebind('click', function () {
        //loadSubPage('contact');
        window.open("https://mega.nz/contact");
    });

    M.safeShowDialog('parkwarning', function () {
        $dialog.removeClass('hidden');
        $dialog.focus();
        if (is_mobile) {
            $('.mobile.fm-dialog-container').removeClass('hidden');
        }
        
        return $dialog;
    });
};