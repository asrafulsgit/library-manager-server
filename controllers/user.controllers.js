import prisma from "../config/prismaClient.js";

export const createUser = async (req, res)  => {
  try {
    const {...user} = req.body;

    const isUserExisting = await prisma.user.findFirst({
        where : {
            email : user.email
        }
    })
    
    if (isUserExisting) {
      return res.status(400).json({
        success: false,
        message: 'User Already exist'
      });
    }

    const newUser = await prisma.user.create({
      data : {
        ...user
      }
    })

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (err) {
    console.log(err)

    return res.status(500).json({
        success: false,
        message: 'Something went wrong'
    });
  }
};

