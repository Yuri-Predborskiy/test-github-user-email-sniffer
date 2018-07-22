function setup(req, res) {
    let yuri = new User({
        name: 'Yuri Predborski',
        password: 'safePassword!'
    });

    // save the sample user
    yuri.save(function(err) {
        if (err) { throw err; }
        console.log('User saved successfully');
        res.json({ success: true });
    });
}

module.exports = {
    setup,
};