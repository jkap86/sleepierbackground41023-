'use strict'

const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
    const Trade = sequelize.define("trade", {
        transaction_id: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true
        },
        status_updated: {
            type: DataTypes.BIGINT
        },
        rosters: {
            type: Sequelize.JSONB,
        },
        managers: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        players: {
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        adds: {
            type: Sequelize.JSONB
        },
        drops: {
            type: Sequelize.JSONB
        },
        draft_picks: {
            type: Sequelize.JSONB
        },
        drafts: {
            type: Sequelize.JSONB
        },
        price_check: {
            type: Sequelize.JSONB
        }
    }, {
        indexes: [
            {
                fields: [{ attribute: 'status_updated', operator: 'DESC' }],


            }
        ],
        hooks: {
            afterBulkCreate: async (trades, options) => {
                const userTradeData = []

                for (const trade of trades) {

                    for (const m of trade.managers.filter(m => parseInt(m) > 0)) {
                        const manager = await sequelize.model('user').findByPk(m)
                        const manager_leagues = await manager.getLeagues()

                        for (const manager_league of manager_leagues) {
                            const manager_lm = await manager_league.getUsers()
                            manager_lm
                                .filter(m_lm => parseInt(m_lm.user_id) > 0)
                                .forEach(m_lm => {
                                    return userTradeData.push({
                                        userUserId: m_lm.user_id,
                                        tradeTransactionId: trade.transaction_id
                                    })


                                })
                        }


                    }
                }
                try {
                    await sequelize.model('usertrades').bulkCreate(userTradeData, { ignoreDuplicates: true })

                } catch (error) {
                    console.log(error)
                }

                return
            }
        }
    });

    return Trade;
};