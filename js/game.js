/****************************************************************
 CLASS: Game
 ****************************************************************/
 class Game{
    #previousTimeStamp;
    #gameState;
    
    constructor(){
        // game state
        this.#gameState = GAME_STATE.LOADING;
        
        // timestamp for gameloop
        this.#previousTimeStamp = 0;

        // elements
        this._inGameUI = new inGameUI();
        this._debugger = new Debugger();
        this._titleScreen = new TitleScreen();
        this._background = new Starfield();
        this._currentStageNumber = 0;

        // background
        this._background.fillStarfield();
        this._background.draw();

        // game data
        this._credits = -1;
        this._initialCredits = -1;

        // generate title screen stage
        stage.loadStage(0);
    }

    initialise(){
        this._initialCredits = gameData.general.initialCredits;
        this.setCredits(this._initialCredits);
    }

    getGameState(){
        return this.#gameState;
    }

    setGameState(gameState){
        // failsafe for invalid entries
        if(gameState > Object.keys(GAME_STATE).length || gameState < 0){
            return;
        }
        this.#gameState = gameState;
    }

    getCredits(){
        return this._credits;
    }

    setCredits(value){
        this._credits = value;
        this._inGameUI.updateInformation("credits", this._credits);
    }

    setCurrentStageNumber(stageNumber){
        this._currentStageNumber = stageNumber;
    }

    /**************** INGAME STUFF ******************************************/
    joinPlayer(playerNumber){
        if(this.getCredits() > 0){
            this.setCredits(this.getCredits()-1);
            stage.getPlayers().getElement(playerNumber-1).activate();
            stage.getPlayers().getElement(playerNumber-1).resetPosition();
        }
    }
      
    


    gameLoop(timeStamp){
        // Elapsed time:
        // calculate the number of seconds passed since the last frame
        // limit this so that in case of lag we are doing 100ms steps
        // even though the time between updates might be longer
        let milliSecondsPassed;
        milliSecondsPassed = (timeStamp - this.#previousTimeStamp);
        milliSecondsPassed = Math.min(milliSecondsPassed, 100);
        this.#previousTimeStamp = timeStamp;  
        
        inputHandler.handleInput(this.#gameState);

        switch(this.#gameState) {

            case GAME_STATE.LOADING:
                    // TODO: to be replaced with a loading screen
                    console.log("loading");

                    if(gameData.isAllFilesLoaded() ){
                        game.initialise();
                        game.setGameState(GAME_STATE.TITLESCREEN);
                    }
                    
                    if (gameData.isLoadingError){
                        console.log("Loading error. Execution halted.");
                        debugger;
                    }
                break;

            case GAME_STATE.TITLESCREEN:
                // logic: update introscreen: 
                // TODO: switch between different screens: controls / enemies / highscore
                stage.update(milliSecondsPassed);
                this._debugger.update(milliSecondsPassed);
                
                // draw 
                this._titleScreen.draw();
                this._debugger.draw();
                stage.draw();  

                // if a player is active, start stage 1
                for(let i=0; i<stage.players.getLength(); i++){
                    if(stage.players.getElement(i).isActive()){
                        game.setCurrentStageNumber(1);
                        game.setGameState(GAME_STATE.STAGE_LOADING);
                    }
                }
                break;
            
            case GAME_STATE.STAGE_LOADING:
                // update
                stage.loadStage(this._currentStageNumber);
                stage.startStage();
                this._inGameUI.update(milliSecondsPassed);
                this._debugger.update(milliSecondsPassed);

                // draw
                this._inGameUI.draw();
                this._debugger.draw();

                // change state
                this.#gameState = GAME_STATE.STAGE_RUNNING;
                break;
            
            case GAME_STATE.STAGE_RUNNING:
                stage.update(milliSecondsPassed);
                this._inGameUI.update(milliSecondsPassed);
                this._debugger.update(milliSecondsPassed);
                stage.draw();
                this._inGameUI.draw();
                this._debugger.draw();
 
                // stage state check
                switch(stage.getStageState()){
                    case STAGE_STATE.COMPLETED_ENDED:
                        this.#gameState = GAME_STATE.STAGE_ENDED;
                        break;
                    case STAGE_STATE.GAME_OVER_ENDED:
                        this.#gameState = GAME_STATE.GAME_OVER;
                        break;
                }

                break;
            
            case GAME_STATE.STAGE_ENDED:
                this._debugger.update(milliSecondsPassed);
                this._debugger.draw();

                // TODO:
                // is there a next level?
                // if yes, 
                //      generate next level  
                        this._currentStageNumber++;
                        this.#gameState = GAME_STATE.STAGE_LOADING;
                // if no: 
                        //this._gameState = GAME_STATE.GAME_COMPLETED;

                break;           

                
            case GAME_STATE.GAME_OVER:
                this._debugger.update(milliSecondsPassed);
                this._debugger.draw();
                // TODO:
                    // special gameover screen
                    console.log("Game Over");    
                    // follow up with highscore
                    // for now: back to title screen
                    this.#gameState = GAME_STATE.TITLESCREEN;
                    this._currentStageNumber = 0;
                    //this._startingPlayerNumber = -1;
                    stage.loadStage(this._currentStageNumber);             
                    break;    


            case GAME_STATE.GAME_COMPLETED:
                this._debugger.update(milliSecondsPassed);
                this._debugger.draw();
                // this._startingPlayerNumber = -1;
                this.setCredits(this._initialCredits);    
                // TODO:
                // congratulations screen
                console.log("Game completed");
                // follow up with highscore

                break;
            
            case GAME_STATE.ENTER_HIGHSCORE:

                // TODO:
                // highscore
                // follow up with titlescreen

                break;
        }
     
        // loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
 }