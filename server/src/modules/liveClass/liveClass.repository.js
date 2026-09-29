import LiveClass from "../../models/LiveClass.model.js";

class LiveClassRepository {

    async create(data) {

        return LiveClass.create(data);

    }

    async findByTeacher(teacherId) {

        return LiveClass.find({
            teacherId,
        })
            .populate("batchId")
            .populate("teacherId")
            .sort({
                scheduledAt: 1,
            });

    }

    async findAll() {

        return LiveClass.find()
            .populate("batchId")
            .populate("teacherId")
            .sort({
                scheduledAt: 1,
            });

    }

    async findById(id) {

        return LiveClass.findById(id)
            .populate("batchId")
            .populate("teacherId");

    }

    async update(id, data) {

        return LiveClass.findByIdAndUpdate(
            id,
            data,
            {
                new: true,
            }
        )
            .populate("batchId")
            .populate("teacherId");

    }

    async delete(id) {

        return LiveClass.findByIdAndDelete(id);

    }

    async findByBatch(batchId) {

        return LiveClass.find({
            batchId,
        })
            .populate("batchId")
            .populate("teacherId")
            .sort({
                scheduledAt: 1,
            });

    }


    async findByBatches(batchIds) {
    return LiveClass.find({ batchId: { $in: batchIds } })
        .populate("batchId")
        .populate("teacherId")
        .sort({ scheduledAt: 1 });
}


async deleteCompletedByBatches(batchIds) {
    return LiveClass.deleteMany({
        batchId: { $in: batchIds },
        $expr: {
            $lt: [
                { $add: ["$scheduledAt", { $multiply: ["$duration", 60000] }] },
                new Date(),
            ],
        },
    });
}

async findUpcomingByBatches(batchIds) {
    return LiveClass.find({
        batchId: { $in: batchIds },
        $expr: {
            $gte: [
                { $add: ["$scheduledAt", { $multiply: ["$duration", 60000] }] },
                new Date(),
            ],
        },
    })
        .populate("batchId")
        .populate("teacherId")
        .sort({ scheduledAt: 1 });
};
async deleteByBatch(batchId) {
        return LiveClass.deleteMany({
            batchId,
        });
    }
}

export default new LiveClassRepository();