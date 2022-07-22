const sauce = require("../models/Sauce");
const mongoose = require("mongoose");
const fs = require("fs");

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
        .findOne({ _id: req.params.id })
        .then((element) => {
            const filename = element.imageUrl.split("/images/")[1];
            fs.unlink(`images/${filename}`, () => {
                sauce
                    .deleteOne({ _id: req.params.id })
                    .then(() => {
                        res.status(200).json({
                            message: "Objet supprimé !",
                        });
                    })
                    .catch((error) => res.status(401).json({ error }));
            });
        })
        .catch((error) => res.status(401).json({ error }));
};

exports.likeSauce = (req, res) => {
    // permet de retrouver la sauce exact dans la base de données
    sauce
        .findOne({ _id: req.params.id })
        .then((element) => {
            //on supprime les users du array
            const filtreLike = element.usersLiked.filter((user) => {
                return user != req.body.userId;
            });
            const filtreDislike = element.usersDisliked.filter((user) => {
                return user != req.body.userId;
            });

            //On ajoute le like et dislike du user
            if (req.body.like === 1) {
                filtreLike.push(req.body.userId);
            } else if (req.body.like === -1) {
                filtreDislike.push(req.body.userId);
            }

            //Maj de la taille du array user
            element.likes = filtreLike.length;
            element.dislikes = filtreDislike.length;

            //sauvegarder l'élément(like,dislike,nul)
            sauce
                .updateOne(
                    { _id: req.params.id },
                    {
                        likes: element.likes,
                        dislikes: element.dislikes,
                        usersLiked: filtreLike,
                        usersDisliked: filtreDislike,
                    }
                )
                .then(() => {
                    res.status(200).json({
                        message: "Like ajouté !",
                    });
                });
        })
        .catch((error) => res.status(401).json({ error }));
};
