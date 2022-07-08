const sauce = require("../models/Sauce");
const mongoose = require("mongoose");

exports.getAllSauce = (req, res, next) => {
    sauce
        .find()
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(400).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const newSauce = new sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
        }`,
        likes: 0,
        dislikes: 0,
    });

    newSauce
        .save()
        .then(() => {
            res.status(201).json({ message: "Objet enregistré !" });
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.getOneSauce = (req, res, next) => {
    sauce
        .findOne({ _id: req.params.id })
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file
        ? {
              ...JSON.parse(req.body.sauce),
              imageUrl: `${req.protocol}://${req.get("host")}/images/${
                  req.file.filename
              }`,
          }
        : { ...req.body };
    sauce
        .updateOne({ _id: req.params.id }, { ...sauceObject })
        .then(() => res.status(200).json({ message: "Objet modifié!" }))
        .catch((error) => res.status(401).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    sauce
        .deleteOne({ _id: req.params.id })
        .then(() => {
            res.status(200).json({
                message: "Objet supprimé !",
            });
        })
        .catch((error) => res.status(401).json({ error }));
};

exports.likeSauce = (req, res) => {
    // permet de retrouver la sauce exact dans la base de données
    sauce
        .findOne({ _id: req.params.id })
        .then((element) => {
            //si like = 1
            if (req.body.like === 1) {
                // on ajoute +1 au like
                element.likes += 1;
                element.usersLiked.push(req.body.userId);
            }

            //si dislike = -1
            if (req.body.like === -1) {
                //on ajoute +1 au dislike
                element.dislikes += 1;
                element.usersDisliked.push(req.body.userId);
            }
            //sauvegarder l'élément(like,dislike,nul)
            sauce
                .updateOne(
                    { _id: req.params.id },
                    {
                        likes: element.likes,
                        dislikes: element.dislikes,
                        usersLiked: element.usersLiked,
                        usersDisliked: element.usersDisliked,
                    }
                )
                .then(() => {
                    res.status(200).json({
                        message: "Like ajouté !",
                    });
                });

            // l'utilisateur ne doit pas liker 2 fois une photo
            // quand il enlève son like ou dislike
            // le tableau ne doit pas contenir 2 fois le user

            //si pas de like ou dislike = 0
            /*if (req.body.like === 0) {
            }*/
        })

        .catch((error) => res.status(401).json({ error }));
};
