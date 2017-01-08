//**load the canvas scene- preload logic
window.onload=function () {
    manifest = [
        {src: 'gif.gif', id: 'img1'},
        {src: 'pause.png', id: 'img2'},
        {src: 'play.png', id: 'img3'},
        {src: 'song.mp3', id: 'sona'}
    ];

    loader = new createjs.LoadQueue(false);
    // 关键！----设置并发数
    loader.setMaxConnections(100);
    loader.installPlugin(createjs.Sound);
    // 关键！---一定要将其设置为 true, 否则不起作用。
    loader.maintainScriptOrder=true;
    loader.addEventListener('complete', handleComplete);//加载完成 调用handleComplete函数
    loader.addEventListener('progress', handleFileProgress);//加载完成 调用handleFileProgress函数
    loader.loadManifest(manifest);
};

function handleFileProgress() {
    var percent=loader.progress*100|0+'%';
    console.log(loader.progress+" "+percent);
    document.getElementById('percent').innerHTML=percent+"%";
};

function handleComplete() {
    console.log("complete!");
    AudioStart();

};

function AudioStart() {
    //variables
    var audio,
        analyser,
        audioApi,
        sourceNode;

    // ANIMATION SETUP
    //创建canvas画布
    var canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d'),
        width = canvas.width = window.innerWidth,
        height = canvas.height = window.innerHeight,
        particleCount = 256, // AUDIO NODES
        slice = Math.PI * 2 / particleCount,
        particles = [];

    //create web audioContext
    function isUndef(val){
        return val === void 0;
    }
    var audioContext;
    if(isUndef(window.AudioContext)){
        console.log('window.audiocontext');
        window.AudioContext = window.webkitAudioContext;
    }
    if(isUndef(window.OfflineAudioContext)){
        console.log('window.offlineaudiocontext');
        window.OfflineAudioContext = window.webkitOfflineAudioContext;
    }
    if(!isUndef(AudioContext)){
        console.log('audioContext');
        audioContext = new AudioContext();
    }else {
        throw new Error('Web Audio is not supported in this browser');
    }
    
    // var audioContext = (window.AudioContext || window.webkitAudioContext);

    var preload=document.getElementById('preload');
    var visual=document.getElementById('visual-block');
    var audioInput = document.getElementById('audiofile');
    var audioPause = document.getElementById('audiofile3');

    // var isPlay=false;
    preload.style.display='none';
    visual.style.display='block';
    audioInput.style.display='block';
    audio=new Audio();
    audio.src='song.mp3';
    console.log('AudioScene is shown');
    setup();
    

    audioInput.addEventListener('mousedown', function(event) {
        // stream = URL.createObjectURL(event.target.files[0]);
        //audio = new Audio();
        //audio.src = stream;
        // audio.src = 'shady.mp3';;
        audio.play();

        audioInput.style.display='none';
        audioPause.style.display='block';

        createParticles();
        update();

        //setup();

    });


    audioPause.addEventListener('mousedown',function(event){
        audio.pause();
        audioInput.style.display='block';
        audioPause.style.display='none';
    });



    function setup() {
        // alert("This is setup");

        // if(audioContext){
        //     audioApi = new audioContext();
        // }else{
        //     alert("Oh nos! It appears your browser does not support the Web Audio API, please upgrade or use a different browser");
        // }

        analyser = (analyser || audioContext.createAnalyser());
        analyser.smoothingTimeConstant = 0.75;
        analyser.fftSize = 512;

        sourceNode = audioContext.createMediaElementSource(audio);
        sourceNode.connect(analyser);
        sourceNode.connect(audioContext.destination);

    }

    
    var audioChange = document.getElementById('visual');
    var n=5;
    
    audioChange.addEventListener('mousedown', function(event) {
        n=parseInt(10*Math.random())+1;
        // alert('random'+n);
        update();
    });

   
    

    
    function createParticles() {
        // alert("going to createParticles()");

        for (var i = 0; i < particleCount; i += 1) {
            var angle = i * slice,
                x = width / 2 + Math.cos(angle) * width / 3,
                y = height / 2 + Math.sin(angle) * height / 4;


            var p = particle.create(x, y, 0, -Math.PI / 2, .1);
            p.radius = 0;
            // p.friction = .4;
            p.friction = .4;

            particles.push(p);
        }
    };

    function update() {

        context.clearRect(0, 0, width, height);
        // AUDIO
        
        var freqArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqArray);
        
        // ANIMATION
        for (var i = 0; i < freqArray.length; i += 1) {
            var p = particles[i];
            var v = freqArray[i];

            var count=i;

            //p.velocity.setLength(v / 7);
             p.velocity.setLength(v / 8);
            //p.velocity.setLength(v / 4);

            context.beginPath();
            context.arc(p.position.getX(), p.position.getY(), p.radius + (v / 8), 0, Math.PI * 2, false);
            context.fillStyle = 'hsla(' + (count+n*3) + ', ' + (v) + '%,' + 10*n + '%,' + (0.2 + v / 512) + ')';
            context.fill();


            // COLLISION DETECTION
            if(p.position.getX() + p.radius > width) {
                p.position.setX(width - p.radius);
                p.velocity.setX(p.velocity.getX() * p.bounce);
            }
            if(p.position.getX() - p.radius < 0) {
                p.position.setX(p.radius);
                p.velocity.setX(p.velocity.getX() * p.bounce);
            }
            if(p.position.getY() + p.radius > height) {
                p.position.setY(height - p.radius);
                p.velocity.setY(p.velocity.getY() * p.bounce);
            }
            if(p.position.getY() - p.radius < 0) {
                p.position.setY(p.radius);
                p.velocity.setY(p.velocity.getY() * p.bounce);
            }

            p.update();
        }

        // alert('animationFrame is set');
        window.requestAnimationFrame(update);
        // alert('animationFrame is finish');
    }

}

// PARTICLE LIB

var particle = {
    position: null,
    velocity: null,
    gravity: null,
    mass: 1,
    radius: 0,
    bounce: -1,
    friction: 1,

    create: function(x, y, speed, direction, grav) {
        // alert('particle create');
        var obj = Object.create(this);
        obj.position = vector.create(x, y);
        obj.velocity = vector.create(0, 0);
        obj.velocity.setLength(speed);
        obj.velocity.setAngle(direction);
        obj.gravity = vector.create(0, grav || 0);
        return obj;
    },

    accelerate: function(accel) {
        this.velocity.addTo(accel);
    },

    update: function() {
        this.velocity.multiplyBy(this.friction);
        this.velocity.addTo(this.gravity);
        this.position.addTo(this.velocity);
    },

    angleTo: function(p2) {
        return Math.atan2(p2.position.getY() - this.position.getY(),
            p2.position.getX() - this.position.getX());
    },

    distanceTo: function(p2) {
        var dx = p2.position.getX() - this.position.getX(),
            dy = p2.position.getY() - this.position.getY();

        return Math.sqrt(dx * dx + dy * dy);
    },

    gravitateTo: function(p2) {
        var grav = vector.create(0, 0),
            dist = this.distanceTo(p2);

        grav.setLength(p2.mass / (dist * dist));
        grav.setAngle(this.angleTo(p2));

        this.velocity.addTo(grav);
    }
}


// VECTOR LIB

var vector = {
    _x: 1,
    _y: 0,

    create: function(x, y) {
        var obj = Object.create(this);
        obj.setX(x);
        obj.setY(y);
        return obj;
    },

    setX: function(value) {
        this._x = value;
    },

    getX: function() {
        return this._x;
    },

    setY: function(value) {
        this._y = value;
    },

    getY: function() {
        return this._y;
    },

    setAngle: function(angle) {
        var length = this.getLength();
        this._x = Math.cos(angle) * length;
        this._y = Math.sin(angle) * length;
    },

    getAngle: function() {
        return Math.atan2(this._y, this._x);
    },

    setLength: function(length) {
        var angle = this.getAngle();
        this._x = Math.cos(angle) * length;
        this._y = Math.sin(angle) * length;
    },

    getLength: function() {
        return Math.sqrt(this._x * this._x + this._y * this._y);
    },

    add: function(v2) {
        return vector.create(this._x + v2.getX(), this._y + v2.getY());
    },

    subtract: function(v2) {
        return vector.create(this._x - v2.getX(), this._y - v2.getY());
    },

    multiply: function(val) {
        return vector.create(this._x * val, this._y * val);
    },

    divide: function(val) {
        return vector.create(this._x / val, this._y / val);
    },

    addTo: function(v2) {
        this._x += v2.getX();
        this._y += v2.getY();
    },

    subtractFrom: function(v2) {
        this._x -= v2.getX();
        this._y -= v2.getY();
    },

    multiplyBy: function(val) {
        this._x *= val;
        this._y *= val;
    },

    divideBy: function(val) {
        this._x /= val;
        this._y /= val;
    }
};